// src/features/wineries/modals/WineryInfoEditModal.js

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    TextField,
    Button,
    Stack,
    Typography,
    // ❌ Αφαιρέθηκε το CircularProgress
    Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ModalActions } from '../../../components/buttons';
import { db } from '../../../services/firestore';
import { useNotifier } from '../../../context/NotificationContext';

export default function WineryInfoEditModal({ winery, open, onSaveSuccess, onClose }) {
    const { showNotification } = useNotifier();

    const [location, setLocation] = useState('');
    const [county, setCounty] = useState('');
    const [region, setRegion] = useState('');
    const [website, setWebsite] = useState('');
    const [emails, setEmails] = useState([]);
    const [phones, setPhones] = useState([]);
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open && winery) {
            setLocation(winery.location || '');
            setCounty(winery.county || '');
            setRegion(winery.geographicArea || '');
            setWebsite(winery.contactInfo?.website || '');
            setEmails(winery.contactInfo?.email || []);
            setPhones(winery.contactInfo?.phone || []);
            setNewEmail('');
            setNewPhone('');
        } else if (!open) {
            setLocation(''); setCounty(''); setRegion(''); setWebsite('');
            setEmails([]); setPhones([]); setNewEmail(''); setNewPhone('');
        }
    }, [open, winery]);

    const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

    const addEmail = () => {
        const trimmed = newEmail.trim();
        if (!trimmed) return;
        if (!isValidEmail(trimmed)) {
            showNotification('Μη έγκυρη διεύθυνση email.', 'error');
            return;
        }
        if (emails.includes(trimmed)) {
            showNotification('Το email υπάρχει ήδη.', 'warning');
            return;
        }
        setEmails([...emails, trimmed]);
        setNewEmail('');
    };

    const deleteEmail = (index) => setEmails(emails.filter((_, i) => i !== index));
    
    const addPhone = () => {
        const trimmed = newPhone.trim();
        if (!trimmed) return;
        if (phones.includes(trimmed)) {
            showNotification('Ο αριθμός τηλεφώνου υπάρχει ήδη.', 'warning');
            return;
        }
        setPhones([...phones, trimmed]);
        setNewPhone('');
    };

    const deletePhone = (index) => setPhones(phones.filter((_, i) => i !== index));

    const handleSave = async () => {
        if (!winery || !winery.id) {
            showNotification('Δεν υπάρχει οινοποιείο για αποθήκευση.', 'error');
            return;
        }
        setSaving(true);
        try {
            const ref = doc(db, 'wineries', winery.id);
            await updateDoc(ref, {
                location, county, geographicArea: region,
                contactInfo: { website, email: emails, phone: phones },
                updatedAt: serverTimestamp()
            });
            showNotification('Οι πληροφορίες αποθηκεύτηκαν επιτυχώς!', 'success');
            if (onSaveSuccess) onSaveSuccess();
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
            PaperProps={{ sx: { backgroundColor: '#fff', border: (theme) => `1px solid ${theme.palette.primary.main}`, borderRadius: 2 } }}
        >
            <DialogTitle>
                Επεξεργασία Στοιχείων ({winery?.name || 'Φόρτωση...'})
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={3}>
                    <TextField label="Τοποθεσία" value={location} onChange={(e) => setLocation(e.target.value)} fullWidth />
                    <TextField label="Νομός" value={county} onChange={(e) => setCounty(e.target.value)} fullWidth />
                    <TextField label="Περιφέρεια" value={region} onChange={(e) => setRegion(e.target.value)} fullWidth />
                    <TextField label="Ιστοσελίδα" value={website} onChange={(e) => setWebsite(e.target.value)} fullWidth />

                    <Typography variant="subtitle1">Emails</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {emails.map((email, i) => (
                            <Chip key={i} label={email} onDelete={() => deleteEmail(i)} />
                        ))}
                    </Stack>
                    <Stack direction="row" spacing={1}>
                        <TextField label="Νέο Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} fullWidth />
                        <Button onClick={addEmail} startIcon={<AddIcon />} variant="outlined">Προσθήκη</Button>
                    </Stack>

                    <Typography variant="subtitle1">Τηλέφωνα</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {phones.map((phone, i) => (
                            <Chip key={i} label={phone} onDelete={() => deletePhone(i)} />
                        ))}
                    </Stack>
                    <Stack direction="row" spacing={1}>
                        <TextField label="Νέο Τηλέφωνο" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} fullWidth />
                        <Button onClick={addPhone} startIcon={<AddIcon />} variant="outlined">Προσθήκη</Button>
                    </Stack>
                </Stack>
            </DialogContent>

            <DialogActions>
                <ModalActions onCancel={onClose} onSave={handleSave} saving={saving} />
            </DialogActions>
        </Dialog>
    );
}