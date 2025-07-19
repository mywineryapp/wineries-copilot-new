import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Stack,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { addDoc, updateDoc, deleteDoc, doc, collection, serverTimestamp } from 'firebase/firestore';
import { ModalActions } from '../../../components/buttons';

export default function ContactsEditModal({ winery, contact, open, onClose, onSaveSuccess, db }) {
  const contactRoles = ['Ιδιοκτήτης', 'Υπεύθυνος Επικοινωνίας', 'Οινολόγος', 'Υπεύθυνος Προμηθειών', 'Υπεύθυνος Πωλήσεων', 'Λογιστήριο', 'Γενικός Διευθυντής', 'Γραμματεία', 'Οικονομικός Διευθυντής', 'Υπεύθυνος Παραγωγής', 'Άλλο'];
  const phoneTypes = ['κινητό', 'σταθερό', 'fax', 'άλλα'];

  const [localContact, setLocalContact] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const validateEmail = useCallback((email) => {
    if (!email || email.trim() === '') return true;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }, []);

  useEffect(() => {
    if (open) {
      const initial = contact
        ? {
            ...contact,
            phones: Array.isArray(contact.phones)
              ? contact.phones.map(p => ({ ...p }))
              : [],
            emails: Array.isArray(contact.emails)
              ? contact.emails.map(e => ({ ...e, error: !validateEmail(e.value) }))
              : []
          }
        : {
            name: '',
            role: '',
            phones: [],
            emails: []
          };
      setLocalContact(initial);
      setError(null);
    } else {
      setLocalContact(null);
      setError(null);
    }
  }, [open, contact, validateEmail]);

  const handleChange = (field, value) => {
    setLocalContact(prev => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (index, field, value) => {
    const updated = [...localContact.phones];
    updated[index] = { ...updated[index], [field]: value };
    setLocalContact(prev => ({ ...prev, phones: updated }));
  };

  const handleEmailChange = (index, field, value) => {
    const updated = [...localContact.emails];
    updated[index] = {
      ...updated[index],
      [field]: value,
      error: !validateEmail(value)
    };
    setLocalContact(prev => ({ ...prev, emails: updated }));
  };

  const handleAddPhone = () => {
    setLocalContact(prev => ({
      ...prev,
      phones: [...(prev.phones || []), { value: '', type: 'κινητό' }]
    }));
  };

  const handleDeletePhone = (index) => {
    setLocalContact(prev => ({
      ...prev,
      phones: prev.phones.filter((_, i) => i !== index)
    }));
  };

  const handleAddEmail = () => {
    setLocalContact(prev => ({
      ...prev,
      emails: [...(prev.emails || []), { value: '', error: false }]
    }));
  };

  const handleDeleteEmail = (index) => {
    setLocalContact(prev => ({
      ...prev,
      emails: prev.emails.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!db || !winery?.id) {
      setError('Λείπει σύνδεση με βάση ή ID οινοποιείου.');
      return;
    }

    const invalidEmails = localContact.emails?.filter(e => e.error);
    if (invalidEmails?.length > 0) {
      setError('Υπάρχουν μη έγκυρα email. Διορθώστε τα πριν την αποθήκευση.');
      return;
    }

    const cleanedContact = {
      ...localContact,
      phones: localContact.phones?.filter(p => p.value.trim() !== ''),
      emails: localContact.emails?.filter(e => e.value.trim() !== ''),
      wineryId: winery.id
    };

    try {
      setSaving(true);
      if (contact?.id) {
        const contactRef = doc(db, 'contacts', contact.id);
        await updateDoc(contactRef, {
          ...cleanedContact,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'contacts'), {
          ...cleanedContact,
          createdAt: serverTimestamp()
        });
      }
      onSaveSuccess && onSaveSuccess();
      onClose();
    } catch (err) {
      console.error('Σφάλμα αποθήκευσης:', err);
      setError(`Σφάλμα: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!db || !contact?.id) return;

    const confirmed = window.confirm('Είσαι σίγουρος ότι θέλεις να διαγράψεις αυτή την επαφή;');
    if (!confirmed) return;

    try {
      setSaving(true);
      await deleteDoc(doc(db, 'contacts', contact.id));
      onSaveSuccess && onSaveSuccess();
      onClose();
    } catch (err) {
      console.error('Σφάλμα διαγραφής:', err);
      setError(`Σφάλμα: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'white',
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ position: 'relative' }}>
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
        {contact ? `Επεξεργασία: ${contact.name}` : 'Προσθήκη Υπευθύνου'}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          <TextField
            label="Όνομα"
            value={localContact?.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Ρόλος</InputLabel>
            <Select
              value={localContact?.role || ''}
              onChange={(e) => handleChange('role', e.target.value)}
              label="Ρόλος"
              MenuProps={{ PaperProps: { sx: { bgcolor: 'white' } } }}
            >
              {contactRoles.map((role, i) => (
                <MenuItem key={i} value={role}>{role}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="subtitle2">Τηλέφωνα</Typography>
          {localContact?.phones?.map((phone, i) => (
            <Grid container spacing={1} key={i}>
              <Grid item xs={6}>
                <TextField
                  label="Αριθμός"
                  value={phone.value}
                  onChange={(e) => handlePhoneChange(i, 'value', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Τύπος</InputLabel>
                  <Select
                    value={phone.type}
                    onChange={(e) => handlePhoneChange(i, 'type', e.target.value)}
                    label="Τύπος"
                    MenuProps={{ PaperProps: { sx: { bgcolor: 'white' } } }}
                  >
                    {phoneTypes.map((type, j) => (
                      <MenuItem key={j} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={2}>
                <IconButton onClick={() => handleDeletePhone(i)}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button onClick={handleAddPhone} startIcon={<AddIcon />} size="small">
            Προσθήκη Τηλεφώνου
          </Button>

          <Typography variant="subtitle2">Emails</Typography>
          {localContact?.emails?.map((email, i) => (
            <Grid container spacing={1} key={i}>
              <Grid item xs={10}>
                <TextField
                  label="Email"
                  value={email.value}
                  onChange={(e) => handleEmailChange(i, 'value', e.target.value)}
                  fullWidth
                  error={email.error}
                  helperText={email.error ? 'Μη έγκυρο email' : ''}
                />
              </Grid>
              <Grid item xs={2}>
                <IconButton onClick={() => handleDeleteEmail(i)}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button onClick={handleAddEmail} startIcon={<AddIcon />} size="small">
            Προσθήκη Email
          </Button>

          {error && <Typography color="error">{error}</Typography>}
          <ModalActions onCancel={onClose} onSave={handleSave} saving={saving} />

          {contact?.id && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleDelete}
              sx={{ mt: 2 }}
            >
              🗑️ Διαγραφή Επαφής
            </Button>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}