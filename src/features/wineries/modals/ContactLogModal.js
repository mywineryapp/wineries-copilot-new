import {
  CancelTopRightButton,
  ModalActions,
  DeleteIconButton,
  AddButton
} from '../../components/buttons';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Stack,
  TextField,
  Typography,
  Paper,
  CircularProgress
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect } from 'react';
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';

export default function ContactLogModal({ winery, open, onClose, onSaveSuccess, db }) {
  const [records, setRecords] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && winery) {
      setRecords(winery.contactRecords || []);
      setError(null);
    }
    if (!open) {
      setRecords([]);
      setError(null);
    }
  }, [open, winery]);

  const handleChange = (index, field, value) => {
    const updated = [...records];
    updated[index] = { ...updated[index], [field]: value };
    setRecords(updated);
  };

  const handleAdd = () => {
    setRecords([
      ...records,
      {
        date: '',
        subject: '',
        spokeWith: '',
        by: '',
        notes: '',
        reminderDate: ''
      }
    ]);
  };

  const handleDelete = (index) => {
    setRecords(records.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const ref = doc(db, 'wineries', winery.id);
      await updateDoc(ref, {
        contactRecords: records,
        updatedAt: serverTimestamp()
      });
      onSaveSuccess();
    } catch (err) {
      setError('Σφάλμα κατά την αποθήκευση. Δοκιμάστε ξανά.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Καταγραφή Επικοινωνιών με {winery?.name || ''}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          aria-label="Κλείσιμο"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {records.map((rec, index) => (
            <Paper
              key={index}
              sx={{
                p: 2,
                position: 'relative',
                backgroundColor: '#fff',
                border: (theme) => `1px solid ${theme.palette.primary.main}`,
                borderRadius: 2
              }}
            >
              <Stack spacing={1}>
                <TextField
                  label="Ημερομηνία Επικοινωνίας"
                  type="date"
                  value={rec.date}
                  onChange={(e) => handleChange(index, 'date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="Θέμα"
                  value={rec.subject}
                  onChange={(e) => handleChange(index, 'subject', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Με ποιον μιλήσαμε (πελάτης)"
                  value={rec.spokeWith}
                  onChange={(e) => handleChange(index, 'spokeWith', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Ποιος μίλησε (εμείς)"
                  value={rec.by}
                  onChange={(e) => handleChange(index, 'by', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Σχόλια"
                  multiline
                  rows={2}
                  value={rec.notes}
                  onChange={(e) => handleChange(index, 'notes', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Ημερομηνία Υπενθύμισης"
                  type="date"
                  value={rec.reminderDate}
                  onChange={(e) => handleChange(index, 'reminderDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>

              {/* ✅ Κουμπί Διαγραφής */}
              <Box
                sx={{ position: 'absolute', top: 8, right: 8 }}
                onClick={(e) => e.stopPropagation()}
              >
                <DeleteIconButton
                  onClick={() => handleDelete(index)}
                  aria-label="Διαγραφή Εγγραφής"
                />
              </Box>
            </Paper>
          ))}

          {/* ✅ Κουμπί Προσθήκης */}
          <AddButton onClick={handleAdd}>Προσθήκη Επικοινωνίας</AddButton>

          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

          <ModalActions onCancel={onClose} onSave={handleSave} saving={saving} />
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
