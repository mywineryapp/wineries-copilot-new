// src/features/wineries/modals/ProductionEditModal.js

import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, Stack, Typography, TextField, IconButton,
    Button, Paper, Box, CircularProgress, // ❌ Αφαιρούμε το Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
    doc, getDocs, setDoc, collection, query, where, serverTimestamp, deleteDoc
} from 'firebase/firestore';
import { ModalActions, CancelTopRightButton } from '../../../components/buttons';
import { db as firestoreDbInstance } from '../../../services/firestore';
// ✅ ΝΕΟ IMPORT
import { useNotifier } from '../../../context/NotificationContext';

export default function ProductionEditModal({ winery, open, onClose, db, onSaveSuccess }) {
    // ✅ ΝΕΑ ΓΡΑΜΜΗ
    const { showNotification } = useNotifier();

    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    // ❌ ΑΦΑΙΡΟΥΜΕ ΤΑ STATES ΓΙΑ ERROR/SUCCESS
    // const [error, setError] = useState(null);
    // const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchSalesByYear = async () => {
            setLoading(true);
            const currentDb = db || firestoreDbInstance;

            if (!winery?.id || !currentDb) {
                setLoading(false);
                showNotification("Δεν υπάρχει ID οινοποιείου ή σύνδεση βάσης δεδομένων.", 'error');
                return;
            }

            try {
                const salesCollectionRef = collection(currentDb, 'sales_by_year');
                const q = query(salesCollectionRef, where('wineryId', '==', winery.id));
                const snapshot = await getDocs(q);

                const fetchedData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                fetchedData.sort((a, b) => Number(b.year) - Number(a.year)); // Ταξινόμηση
                setSalesData(fetchedData);
            } catch (err) {
                showNotification(`Σφάλμα φόρτωσης δεδομένων: ${err.message}`, 'error');
                setSalesData([]);
            } finally {
                setLoading(false);
            }
        };

        if (open && winery?.id) {
            fetchSalesByYear();
        } else if (!open) {
            setSalesData([]);
        }
    }, [open, winery?.id, db, showNotification]);

    const handleAddSaleEntry = () => {
        setSalesData(prev => [
            { id: `new-${Date.now()}`, year: new Date().getFullYear(), product: '', quantity: '', value: '' },
            ...prev
        ]);
    };

    const handleDeleteSaleEntry = async (indexToDelete) => {
        const entry = salesData[indexToDelete];
        if (!entry) return;

        setSaving(true);
        try {
            const currentDb = db || firestoreDbInstance;
            if (entry.id && !String(entry.id).startsWith('new-')) {
                const docRef = doc(currentDb, 'sales_by_year', entry.id);
                await deleteDoc(docRef);
            }
            setSalesData(prev => prev.filter((_, i) => i !== indexToDelete));
            showNotification('Η εγγραφή διαγράφηκε επιτυχώς.', 'info');
            onSaveSuccess && onSaveSuccess();
        } catch (err) {
            showNotification(`Σφάλμα διαγραφής εγγραφής: ${err.message}.`, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleChangeSaleField = (index, field, value) => {
        setSalesData(prev => {
            const newArray = [...prev];
            newArray[index] = { ...newArray[index], [field]: value };
            return newArray;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        const currentDb = db || firestoreDbInstance;

        if (!winery || !winery.id || !currentDb) {
            showNotification('Δεν υπάρχει ID οινοποιείου ή βάση δεδομένων για αποθήκευση.', 'error');
            setSaving(false);
            return;
        }

        try {
            const savePromises = salesData.map(async (entry) => {
                if (!entry.year || isNaN(Number(entry.year)) || String(entry.product).trim() === '') {
                    // Παρακάμπτουμε τις άδειες νέες εγγραφές χωρίς να πετάξουμε σφάλμα
                    if (String(entry.id).startsWith('new-') && !entry.product && !entry.quantity && !entry.value) {
                        return Promise.resolve();
                    }
                    throw new Error(`Το έτος ή το προϊόν είναι μη έγκυρο για την εγγραφή.`);
                }

                const docId = String(entry.id).startsWith('new-') ? doc(collection(currentDb, 'sales_by_year')).id : entry.id;
                const docRef = doc(currentDb, 'sales_by_year', docId);

                await setDoc(docRef, {
                    wineryId: winery.id,
                    year: Number(entry.year),
                    product: String(entry.product).trim(),
                    quantity: Number(entry.quantity) || 0,
                    value: Number(entry.value) || 0,
                    updatedAt: serverTimestamp()
                }, { merge: true });
            });

            await Promise.all(savePromises);
            showNotification('Οι αλλαγές αποθηκεύτηκαν επιτυχώς!', 'success');
            onSaveSuccess && onSaveSuccess();
            onClose();

        } catch (err) {
            showNotification(`Σφάλμα αποθήκευσης: ${err.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { backgroundColor: 'white', borderRadius: 2, border: '1px solid #e0e0e0' } }}
            BackdropProps={{ style: { backgroundColor: 'rgba(0, 0, 0, 0.7)' } }}
        >
            <DialogTitle sx={{ pb: 1, position: 'relative', backgroundColor: 'white' }} variant="h6">
                Επεξεργασία Στοιχείων Πωλήσεων ({winery?.name || 'Φόρτωση...'})
                <CancelTopRightButton onClick={onClose} />
            </DialogTitle>

            <DialogContent dividers sx={{ p: 2, backgroundColor: 'white' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Stack spacing={3}>
                        {/* ❌ ΤΑ ALERTS ΑΦΑΙΡΟΥΝΤΑΙ */}
                        {salesData.length === 0 && (
                            <Typography variant="body2" color="text.secondary" align="center">
                                Δεν υπάρχουν καταχωρημένα δεδομένα πωλήσεων. Προσθέστε μια εγγραφή για να ξεκινήσετε.
                            </Typography>
                        )}

                        {salesData.map((entry, index) => (
                            <Paper key={entry.id} elevation={0} sx={{ p: 2, position: 'relative', borderRadius: 2, border: '1px solid #f0f0f0' }}>
                                <IconButton
                                    onClick={() => handleDeleteSaleEntry(index)}
                                    sx={{ position: 'absolute', top: 8, right: 8 }}
                                    aria-label="Διαγραφή Εγγραφής"
                                    color="error"
                                    disabled={saving}
                                >
                                    <DeleteIcon />
                                </IconButton>
                                <Stack spacing={2}>
                                    <TextField label="Έτος" type="number" fullWidth value={entry.year} onChange={(e) => handleChangeSaleField(index, 'year', e.target.value)} variant="outlined" size="small" />
                                    <TextField label="Προϊόν" fullWidth value={entry.product} onChange={(e) => handleChangeSaleField(index, 'product', e.target.value)} variant="outlined" size="small" />
                                    <TextField label="Ποσότητα" type="number" fullWidth value={entry.quantity} onChange={(e) => handleChangeSaleField(index, 'quantity', e.target.value)} variant="outlined" size="small" />
                                    <TextField label="Αξία (€)" type="number" fullWidth value={entry.value} onChange={(e) => handleChangeSaleField(index, 'value', e.target.value)} inputProps={{ step: "0.01" }} variant="outlined" size="small" />
                                </Stack>
                            </Paper>
                        ))}

                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={handleAddSaleEntry}
                            sx={{ alignSelf: 'flex-start' }}
                            disabled={saving}
                        >
                            Προσθήκη Εγγραφής
                        </Button>
                    </Stack>
                )}
            </DialogContent>
            <ModalActions onCancel={onClose} onSave={handleSave} saving={saving} />
        </Dialog>
    );
}