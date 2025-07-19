// src/features/wineries/modals/WineryCommunicationEditModal.js

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  // ❌ Αφαιρέθηκε το IconButton
  Button,
  Stack,
  TextField,
  Checkbox,
  FormControlLabel,
  Chip,
  // ❌ Αφαιρέθηκε το CircularProgress
  Alert,
} from '@mui/material';
// ❌ Αφαιρέθηκε το CloseIcon
import AddIcon from '@mui/icons-material/Add';
import { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../services/firestore';
import { CancelTopRightButton, ModalActions } from '../../../components/buttons';
import { useNotifier } from '../../../context/NotificationContext';

export default function WineryCommunicationEditModal({ winery, open, onClose, onSaveSuccess }) {
  const { showNotification } = useNotifier();
  const [communications, setCommunications] = useState([]);
  const [newEntry, setNewEntry] = useState({
    date: '', reason: '', contactWith: '',
    subject: '', comments: '', openTopic: true
  });

  const [saving, setSaving] = useState(false);
  // ❌ Αφαιρέθηκε το error και success state

  useEffect(() => {
    if (open && winery) {
      setCommunications(winery.communications || []);
      setNewEntry({
        date: new Date().toISOString().slice(0, 10),
        reason: '', contactWith: '', subject: '',
        comments: '', openTopic: true
      });
    }
  }, [open, winery]);

  const handleAddEntry = () => {
    if (!newEntry.date || !newEntry.reason) {
      showNotification('Η ημερομηνία και ο λόγος είναι υποχρεωτικά.', 'error');
      return;
    }
    setCommunications([...communications, newEntry]);
    setNewEntry({
      date: new Date().toISOString().slice(0, 10),
      reason: '', contactWith: '', subject: '',
      comments: '', openTopic: true
    });
  };

  const handleDeleteEntry = (index) => {
    setCommunications(communications.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const ref = doc(db, 'wineries', winery.id);
      await updateDoc(ref, {
        communications,
        updatedAt: serverTimestamp()
      });
      showNotification('Οι επικοινωνίες αποθηκεύτηκαν!', 'success');
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      showNotification('Σφάλμα κατά την αποθήκευση.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Επεξεργασία Επικοινωνιών
        <CancelTopRightButton onClick={onClose} />
      </DialogTitle>

      <DialogContent dividers>
        {/* ❌ Αφαιρέθηκαν τα Alert */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          <TextField label="Ημερομηνία" type="date" InputLabelProps={{ shrink: true }} value={newEntry.date} onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })} fullWidth />
          <TextField label="Λόγος Επικοινωνίας" value={newEntry.reason} onChange={(e) => setNewEntry({ ...newEntry, reason: e.target.value })} fullWidth />
          <TextField label="Επικοινωνία με" value={newEntry.contactWith} onChange={(e) => setNewEntry({ ...newEntry, contactWith: e.target.value })} fullWidth />
          <TextField label="Θέμα" value={newEntry.subject} onChange={(e) => setNewEntry({ ...newEntry, subject: e.target.value })} fullWidth />
          <TextField label="Σχόλια" value={newEntry.comments} onChange={(e) => setNewEntry({ ...newEntry, comments: e.target.value })} fullWidth multiline rows={3} />
          <FormControlLabel control={ <Checkbox checked={newEntry.openTopic} onChange={(e) => setNewEntry({ ...newEntry, openTopic: e.target.checked })} /> } label="Το θέμα παραμένει ανοιχτό" />
          <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddEntry}>
            Προσθήκη Επικοινωνίας
          </Button>
        </Stack>

        <Stack spacing={2}>
          {communications.map((c, i) => (
            <Stack key={i} spacing={1} sx={{ border: '1px solid #ddd', borderRadius: 2, p: 2, bgcolor: '#fafafa' }}>
              <Stack direction="row" spacing={1}>
                <Chip label={c.date} />
                <Chip label={c.reason} color="primary" />
                <Chip label={c.openTopic ? 'Ανοιχτό' : 'Κλειστό'} variant="outlined" />
              </Stack>
              <div>Με: {c.contactWith || '—'}</div>
              <div>Θέμα: {c.subject || '—'}</div>
              <div>Σχόλια: {c.comments || '—'}</div>
              <Button color="error" size="small" onClick={() => handleDeleteEntry(i)}>Διαγραφή</Button>
            </Stack>
          ))}
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <ModalActions onCancel={onClose} onSave={handleSave} saving={saving} />
      </DialogActions>
    </Dialog>
  );
}