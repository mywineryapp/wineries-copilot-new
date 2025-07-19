// src/components/buttons/ModalActions.js

import React from 'react';
import { Stack, CircularProgress, DialogActions, Button, Chip } from '@mui/material'; // Αφαιρέθηκε το Typography
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { formatLabel } from '../../utils/greek';

const EmailStatus = ({ status }) => {
  if (!status || status === 'idle') return null;
  const config = {
    sending: { label: 'Αποστολή...', icon: <CircularProgress size={16} color="inherit" />, color: 'primary' },
    sent: { label: 'Εστάλη', icon: <CheckCircleOutlineIcon />, color: 'success' },
    failed: { label: 'Σφάλμα Αποστολής', icon: <ErrorOutlineIcon />, color: 'error' },
  };
  const currentStatus = config[status];
  if (!currentStatus) return null;
  return ( <Chip icon={currentStatus.icon} label={currentStatus.label} color={currentStatus.color} variant="outlined" size="small" /> );
};

export default function ModalActions({ onClose, onSave, saving, showSendEmail, onSendEmail, onDelete, emailStatus, }) {
  return (
    <DialogActions sx={{ p: 2, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        {onDelete && ( <Button variant="outlined" color="error" onClick={onDelete} disabled={saving || emailStatus === 'sending'} startIcon={<DeleteIcon />} > {formatLabel('Διαγραφή')} </Button> )}
        {showSendEmail && ( <Button variant="outlined" color="secondary" onClick={onSendEmail} disabled={saving || emailStatus === 'sending'} startIcon={emailStatus === 'sending' ? <CircularProgress size={20} /> : <SendIcon />} > {formatLabel('Αποστολή Email')} </Button> )}
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <EmailStatus status={emailStatus} />
        <Button variant="text" onClick={onClose} disabled={saving || emailStatus === 'sending'} > {formatLabel('Ακύρωση')} </Button>
        <Button variant="contained" onClick={onSave} disabled={saving || emailStatus === 'sending'} startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} > {formatLabel('Αποθήκευση')} </Button>
      </Stack>
    </DialogActions>
  );
}