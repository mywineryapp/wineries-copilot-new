// src/features/wineries/modals/OrderEditModal.js

import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, IconButton, Stack, Typography,
    TextField, Button, Grid, FormControl, InputLabel, OutlinedInput,
    InputAdornment, Checkbox, FormControlLabel, Paper, DialogActions,
    DialogContentText, CircularProgress, Box, 
    // ✅ ΝΕΑ IMPORTS ΓΙΑ ΤΗΝ ΟΜΟΡΦΗ ΕΜΦΑΝΙΣΗ
    Divider, Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { el } from 'date-fns/locale';
import { httpsCallable } from 'firebase/functions'; // ✅ ΓΙΑ ΤΗΝ ΚΛΗΣΗ ΤΟΥ EMAIL
import { addDoc, doc, updateDoc, collection, serverTimestamp, deleteDoc } from 'firebase/firestore';

import { db, functions } from '../../../services/firestore'; // ✅ Προσθέτουμε το functions
import { useNotifier } from '../../../context/NotificationContext';
import ModalActions from '../../../components/buttons/ModalActions';
import FirestoreAutocomplete from '../../../components/FirestoreAutocomplete';

const initialProductState = {
    tempId: `product_${Date.now()}`,
    quantity: 1, closureTypeId: null, bottleTypeId: null, bottleCompanyIds: [],
    wineTypeId: null, printingType: 'Ατύπωτα', notes: '', deliveryDate: null,
};

// Ένα μικρό component για τους όμορφους τίτλους
const SectionDivider = ({ label }) => (
    <Divider sx={{ my: 2, '&::before, &::after': { borderColor: 'primary.light' } }}>
        <Chip label={label} color="primary" variant="outlined" size="small" />
    </Divider>
);

export default function OrderEditModal({ open, onClose, order, wineryId, onSaveSuccess }) {
    const { showNotification } = useNotifier();
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);
    // ✅ ΝΕΟ STATE ΓΙΑ ΤΗΝ ΚΑΤΑΣΤΑΣΗ ΤΟΥ EMAIL
    const [emailStatus, setEmailStatus] = useState('idle'); // idle | sending | sent | failed
    
    const [orderData, setOrderData] = useState({
        wineryId: '', orderDate: new Date(), products: [initialProductState],
    });

    useEffect(() => {
        if (open) {
            setEmailStatus('idle'); // Επαναφορά κατάστασης email κάθε φορά που ανοίγει το modal
            if (order) {
                setOrderData({
                    id: order.id, wineryId: order.wineryId,
                    orderDate: order.orderDate?.toDate ? order.orderDate.toDate() : new Date(),
                    products: order.products.map((p, index) => ({
                        ...p, tempId: `product_${index}`,
                        deliveryDate: p.deliveryDate?.toDate() || null
                    })) || [{...initialProductState, tempId: `product_${Date.now()}`}],
                });
            } else {
                setOrderData({
                    wineryId: wineryId || '', orderDate: new Date(),
                    products: [{...initialProductState, tempId: `product_${Date.now()}`}],
                });
            }
        }
    }, [open, order, wineryId]);

    const handleOrderDataChange = (field, value) => setOrderData(prev => ({ ...prev, [field]: value }));

    const updateProductField = (index, field, value) => {
        setOrderData(prev => {
            const updatedProducts = [...prev.products];
            updatedProducts[index] = { ...updatedProducts[index], [field]: value };
            return { ...prev, products: updatedProducts };
        });
    };
    
    // ... (Οι υπόλοιπες συναρτήσεις handle... παραμένουν ίδιες)
    const handleQuantityChange = (index, increment) => {
        const currentQuantity = Number(orderData.products[index].quantity) || 0;
        const newQuantity = currentQuantity + increment;
        updateProductField(index, 'quantity', Math.max(0, newQuantity));
    };

    const handleAddProduct = () => {
        setOrderData(prev => ({
            ...prev,
            products: [...prev.products, {...initialProductState, tempId: `product_${Date.now()}`}]
        }));
    };

    const handleDeleteProduct = (index) => {
        if (orderData.products.length <= 1) {
            showNotification('Δεν μπορείτε να διαγράψετε το τελευταίο προϊόν.', 'warning');
            return;
        }
        setOrderData(prev => ({ ...prev, products: prev.products.filter((_, i) => i !== index) }));
    };

    const handleSave = async () => {
        if (!orderData.wineryId) {
            showNotification('Το οινοποιείο είναι απαραίτητο.', 'error');
            return;
        }
        setSaving(true);
        try {
            const productsToSave = orderData.products.map(({ tempId, ...rest }) => rest);
            const dataToSave = { ...orderData, products: productsToSave, updatedAt: serverTimestamp() };
            
            if (order?.id) {
                await updateDoc(doc(db, 'orders', order.id), dataToSave);
                showNotification('Η παραγγελία ενημερώθηκε!', 'success');
            } else {
                delete dataToSave.id; 
                dataToSave.createdAt = serverTimestamp();
                await addDoc(collection(db, 'orders'), dataToSave);
                showNotification('Η παραγγελία δημιουργήθηκε!', 'success');
            }
            onSaveSuccess();
            onClose();
        } catch (err) {
            showNotification(`Σφάλμα αποθήκευσης: ${err.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteOrder = async () => {
        setDeleting(true);
        try {
            await deleteDoc(doc(db, 'orders', order.id));
            showNotification('Η παραγγελία διαγράφηκε.', 'info');
            onSaveSuccess();
            onClose();
        } catch (err) {
            showNotification(`Σφάλμα διαγραφής: ${err.message}`, 'error');
        } finally {
            setDeleting(false);
            setOpenConfirmDeleteDialog(false);
        }
    };
    
    // ✅✅✅ ΝΕΑ ΣΥΝΑΡΤΗΣΗ ΓΙΑ ΑΠΟΣΤΟΛΗ EMAIL ✅✅✅
    const handleSendEmail = async () => {
        if (!order?.id) {
            showNotification('Πρέπει πρώτα να αποθηκεύσετε την παραγγελία για να στείλετε email.', 'warning');
            return;
        }
        
        setEmailStatus('sending');
        try {
            // Προετοιμάζουμε τη cloud function που θα καλέσουμε
            const sendOrderEmail = httpsCallable(functions, 'sendOrderEmail');
            // Καλούμε τη function με το ID της παραγγελίας
            const result = await sendOrderEmail({ orderId: order.id });
            
            if (result.data.success) {
                setEmailStatus('sent');
                showNotification('Το email στάλθηκε με επιτυχία!', 'success');
            } else {
                throw new Error(result.data.error || 'Άγνωστο σφάλμα από τον server.');
            }
        } catch (error) {
            setEmailStatus('failed');
            showNotification(`Η αποστολή email απέτυχε: ${error.message}`, 'error');
            console.error("Email sending error:", error);
        }
    };


    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={el}>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle sx={{ pb: 1, position: 'relative' }}>
                    {order ? 'Επεξεργασία Παραγγελίας' : 'Δημιουργία Νέας Παραγγελίας'}
                    <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                    <Stack spacing={4}>
                        {/* ✅ ΝΕΑ ΕΜΦΑΝΙΣΗ & ΔΙΑΤΑΞΗ */}
                        <Paper elevation={0} sx={{ p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                            <SectionDivider label="Βασικά Στοιχεία" />
                            <Stack spacing={2} sx={{mt: 2}}>
                                <FirestoreAutocomplete
                                    collectionName="wineries" label="Οινοποιείο"
                                    value={orderData.wineryId}
                                    onChange={(id) => handleOrderDataChange('wineryId', id)}
                                />
                                <DatePicker label="Ημερομηνία Παραγγελίας" format="dd/MM/yyyy"
                                    value={orderData.orderDate}
                                    onChange={date => handleOrderDataChange('orderDate', date)}
                                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                                />
                            </Stack>
                        </Paper>

                        <Box>
                            <SectionDivider label="Προϊόντα" />
                            <Stack spacing={3} sx={{mt: 2}}>
                                {orderData.products.map((product, index) => (
                                    <Paper key={product.tempId} elevation={0} sx={{ p: 2, position: 'relative', borderRadius: 2, border: '1px solid #f0f0f0' }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                            <Typography variant="subtitle1" component="div">Προϊόν #{index + 1}</Typography>
                                            <IconButton onClick={() => handleDeleteProduct(index)} size="small"><DeleteIcon color="error" /></IconButton>
                                        </Stack>
                                        
                                        <Stack spacing={2}>
                                            <FormControl fullWidth variant="outlined" size="small">
                                                <InputLabel>Ποσότητα</InputLabel>
                                                <OutlinedInput type="number" value={product.quantity || ''}
                                                    onChange={e => updateProductField(index, 'quantity', e.target.value)}
                                                    startAdornment={<InputAdornment position="start"><IconButton size="small" onClick={() => handleQuantityChange(index, -1)}><RemoveIcon fontSize="small" /></IconButton></InputAdornment>}
                                                    endAdornment={<InputAdornment position="end"><IconButton size="small" onClick={() => handleQuantityChange(index, 1)}><AddIcon fontSize="small" /></IconButton></InputAdornment>}
                                                    label="Ποσότητα" />
                                            </FormControl>
                                            <FirestoreAutocomplete collectionName="closureTypes" label="Πώμα" value={product.closureTypeId} onChange={id => updateProductField(index, 'closureTypeId', id)} />
                                            <FirestoreAutocomplete collectionName="bottleTypes" label="Τύπος Φιάλης" value={product.bottleTypeId} onChange={id => updateProductField(index, 'bottleTypeId', id)} />
                                            <FirestoreAutocomplete collectionName="bottleCompanies" label="Εταιρεία Φιάλης" value={product.bottleCompanyIds} onChange={ids => updateProductField(index, 'bottleCompanyIds', ids)} multiple />
                                            <FirestoreAutocomplete collectionName="wines" label="Κρασί" value={product.wineTypeId} onChange={id => updateProductField(index, 'wineTypeId', id)} filterQuery={['wineryId', '==', orderData.wineryId]} newDocExtraData={{ wineryId: orderData.wineryId }} disabled={!orderData.wineryId} />
                                            <TextField fullWidth label="Σημειώσεις" value={product.notes} onChange={e => updateProductField(index, 'notes', e.target.value)} multiline rows={2} variant="outlined" size="small" />
                                            <DatePicker label="Ημ/νία Παράδοσης Προϊόντος" format="dd/MM/yyyy" value={product.deliveryDate} onChange={date => updateProductField(index, 'deliveryDate', date)} slotProps={{ textField: { fullWidth: true, size: 'small' } }} />
                                            <FormControlLabel control={<Checkbox checked={product.printingType === 'Τυπωμένα'} onChange={e => updateProductField(index, 'printingType', e.target.checked ? 'Τυπωμένα' : 'Ατύπωτα')} />} label="Τυπωμένα" sx={{whiteSpace: 'nowrap'}}/>
                                        </Stack>
                                    </Paper>
                                ))}
                                <Button startIcon={<AddIcon />} onClick={handleAddProduct} variant="outlined" sx={{ mt: 2 }}>Προσθήκη Προϊόντος</Button>
                             </Stack>
                        </Box>
                    </Stack>
                </DialogContent>
                <ModalActions
                    onCancel={onClose}
                    onSave={handleSave}
                    saving={saving || deleting}
                    onDelete={order?.id ? () => setOpenConfirmDeleteDialog(true) : null}
                    // ✅ ΝΕΑ PROPS ΓΙΑ ΤΟ EMAIL
                    showSendEmail={!!order?.id}
                    onSendEmail={handleSendEmail}
                    emailStatus={emailStatus}
                />
            </Dialog>

            <Dialog open={openConfirmDeleteDialog} onClose={() => setOpenConfirmDeleteDialog(false)}>
                <DialogTitle>Επιβεβαίωση Διαγραφής</DialogTitle>
                <DialogContent><DialogContentText>Είστε σίγουροι ότι θέλετε να διαγράψετε οριστικά αυτή την παραγγελία;</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirmDeleteDialog(false)} disabled={deleting}>Ακύρωση</Button>
                    <Button onClick={handleDeleteOrder} color="error" disabled={deleting}>
                        {deleting ? <CircularProgress size={20} /> : 'Διαγραφή'}
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
}