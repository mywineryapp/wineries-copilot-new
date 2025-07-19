import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField,
    Checkbox, FormControlLabel
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { el } from 'date-fns/locale';
import { doc, addDoc, updateDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '../../services/firestore';
import { useNotifier } from '../../context/NotificationContext';
import FirestoreAutocomplete from '../../components/FirestoreAutocomplete';

// Η αρχική, καθαρή κατάσταση της φόρμας
const getInitialState = (wineryId = '', wineryName = '') => ({
    wineryId: wineryId,
    wineryName: wineryName,
    salespersonId: '',
    salespersonName: '',
    purposeId: '',
    purposeName: '',
    contactPersonId: '', 
    contactPersonName: '',
    contactDate: new Date(),
    result: '',
    nextSteps: '',
    reminderDate: null,
    isHighPriority: false,
    isClosed: false,
});

export default function CommunicationEditModal({ open, onClose, communication, wineryId, wineryName }) {
    const { showNotification } = useNotifier();
    const [formData, setFormData] = useState(getInitialState());
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) {
            if (communication) { // Αν επεξεργαζόμαστε υπάρχουσα
                setFormData({
                    ...communication,
                    contactDate: communication.contactDate?.toDate(),
                    reminderDate: communication.reminderDate?.toDate() || null,
                });
            } else { // Αν δημιουργούμε νέα
                setFormData(getInitialState(wineryId, wineryName));
            }
        }
    }, [open, communication, wineryId, wineryName]);

    const handleChange = (field, value) => setFormData(p => ({ ...p, [field]: value }));

    const handleAutocompleteChange = (idField, nameField, id, option) => {
        handleChange(idField, id);
        handleChange(nameField, option ? option.name : '');
        if (idField === 'wineryId') {
            handleChange('contactPersonId', null);
            handleChange('contactPersonName', '');
        }
    };

    const handleSave = async () => {
        if (!formData.salespersonId || !formData.wineryId || !formData.purposeId) {
            showNotification('Παρακαλώ συμπληρώστε Πωλητή, Οινοποιείο και Σκοπό.', 'error');
            return;
        }

        setSaving(true);
        try {
            const dataToSave = { ...formData };
            if (communication?.id) {
                await updateDoc(doc(db, 'communications', communication.id), { ...dataToSave, updatedAt: serverTimestamp() });
                showNotification('Η επικοινωνία ενημερώθηκε!', 'success');
            } else {
                await addDoc(collection(db, 'communications'), { ...dataToSave, createdAt: serverTimestamp() });
                showNotification('Η επικοινωνία καταχωρήθηκε!', 'success');
            }
            onClose();
        } catch (error) {
            showNotification(`Σφάλμα αποθήκευσης: ${error.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };
    
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={el}>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>{communication ? 'Επεξεργασία Επικοινωνίας' : 'Νέα Επικοινωνία'}</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2.5} sx={{ pt: 1 }}>
                        <FirestoreAutocomplete
                            collectionName="salespeople"
                            label="Πωλητής"
                            value={formData.salespersonId}
                            onChange={(id, option) => handleAutocompleteChange('salespersonId', 'salespersonName', id, option)}
                            orderByField="sortOrder"
                        />
                        
                        {wineryId ? <TextField label="Οινοποιείο" value={formData.wineryName || ''} disabled fullWidth />
                        : <FirestoreAutocomplete collectionName="wineries" label="Οινοποιείο" value={formData.wineryId} onChange={(id, option) => handleAutocompleteChange('wineryId', 'wineryName', id, option)} />}
                        
                        <FirestoreAutocomplete
                            collectionName="contacts"
                            label="Άτομο Επαφής"
                            value={formData.contactPersonId}
                            onChange={(id, option) => handleAutocompleteChange('contactPersonId', 'contactPersonName', id, option)}
                            filterQuery={['wineryId', '==', formData.wineryId]}
                            newDocExtraData={{ wineryId: formData.wineryId }}
                            disabled={!formData.wineryId}
                            allowCreate={true}
                        />

                        <FirestoreAutocomplete
                            collectionName="communicationPurposes"
                            label="Σκοπός Επικοινωνίας"
                            value={formData.purposeId}
                            onChange={(id, option) => handleAutocompleteChange('purposeId', 'purposeName', id, option)}
                            orderByField="sortOrder"
                        />
                        
                        <DatePicker
                            label="Ημερομηνία Επαφής"
                            value={formData.contactDate}
                            onChange={(newValue) => handleChange('contactDate', newValue)}
                        />
                        
                        <TextField
                            label="Αποτέλεσμα / Σχόλια"
                            value={formData.result || ''}
                            onChange={(e) => handleChange('result', e.target.value)}
                            multiline
                            rows={3}
                        />
                        
                        <TextField
                            label="Επόμενες Ενέργειες"
                            value={formData.nextSteps || ''}
                            onChange={(e) => handleChange('nextSteps', e.target.value)}
                            multiline
                            rows={2}
                        />
                        
                        <DatePicker
                            label="Ημερομηνία Υπενθύμισης"
                            value={formData.reminderDate}
                            onChange={(newValue) => handleChange('reminderDate', newValue)}
                        />
                         
                        <Stack direction="row" justifyContent="space-between">
                            <FormControlLabel control={<Checkbox checked={formData.isHighPriority || false} onChange={(e) => handleChange('isHighPriority', e.target.checked)} color="error" />} label="Υψηλή Προτεραιότητα" />
                            <FormControlLabel control={<Checkbox checked={formData.isClosed || false} onChange={(e) => handleChange('isClosed', e.target.checked)} />} label="Η επικοινωνία έχει κλείσει" />
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={saving}>Ακύρωση</Button>
                    <Button onClick={handleSave} variant="contained" disabled={saving}>{saving ? 'Αποθήκευση...' : 'Αποθήκευση'}</Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
}