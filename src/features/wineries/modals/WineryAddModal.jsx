import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack } from '@mui/material';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; // ✅ Αλλάζουμε τον τρόπο αποθήκευσης
import { db } from '../../../services/firestore';
import { useNotifier } from '../../../context/NotificationContext';

const getInitialState = () => ({
    id: '', // ✅ Το νέο πεδίο για τον κωδικό
    name: '',
    geographicArea: '',
    county: '',
    location: '',
});

export default function WineryAddModal({ open, onClose }) {
    const { showNotification } = useNotifier();
    const [formData, setFormData] = useState(getInitialState());
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) {
            setFormData(getInitialState());
        }
    }, [open]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        // ✅ Έλεγχος και για τον κωδικό και για το όνομα
        if (!formData.id.trim() || !formData.name.trim()) {
            showNotification('Ο Κωδικός και το Όνομα του οινοποιείου είναι υποχρεωτικά.', 'error');
            return;
        }
        setSaving(true);
        try {
            // ✅✅✅ Η ΑΛΛΑΓΗ ΕΙΝΑΙ ΕΔΩ ✅✅✅
            // Δημιουργούμε μια "αναφορά" στο έγγραφο που θέλουμε να φτιάξουμε,
            // χρησιμοποιώντας τον κωδικό που έδωσε ο χρήστης ως ID.
            const wineryRef = doc(db, 'wineries', formData.id.trim());

            // Ετοιμάζουμε τα δεδομένα προς αποθήκευση
            const dataToSave = {
                name: formData.name.trim(),
                geographicArea: formData.geographicArea.trim(),
                county: formData.county.trim(),
                location: formData.location.trim(),
                createdAt: serverTimestamp()
            };

            // Χρησιμοποιούμε setDoc για να δημιουργήσουμε το έγγραφο με το δικό μας ID.
            await setDoc(wineryRef, dataToSave);

            showNotification('Το οινοποιείο δημιουργήθηκε με επιτυχία!', 'success');
            onClose();
        } catch (error) {
            showNotification(`Σφάλμα: ${error.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Προσθήκη Νέου Οινοποιείου</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1, width: '400px' }}>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        label="Κωδικός Οινοποιείου (π.χ. ΣΤ-0273)"
                        value={formData.id}
                        onChange={(e) => handleChange('id', e.target.value)}
                        fullWidth
                    />
                    <TextField
                        required
                        margin="dense"
                        label="Όνομα Οινοποιείου"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        label="Γεωγραφική Περιοχή"
                        value={formData.geographicArea}
                        onChange={(e) => handleChange('geographicArea', e.target.value)}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        label="Νομός"
                        value={formData.county}
                        onChange={(e) => handleChange('county', e.target.value)}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        label="Τοποθεσία / Πόλη"
                        value={formData.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        fullWidth
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Ακύρωση</Button>
                <Button onClick={handleSave} variant="contained" disabled={saving}>
                    {saving ? 'Αποθήκευση...' : 'Αποθήκευση'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}