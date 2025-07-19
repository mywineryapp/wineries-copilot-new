import React from 'react';
import { Button, Stack, CircularProgress } from '@mui/material';
import { CancelTopRightButton } from './button'; // το ήδη έχεις

export function ModalActions({ onCancel, onSave, saving }) {
  return (
    <Stack direction="row" spacing={2}>
      <Button
        onClick={onSave}
        variant="contained"
        color="primary"
        disabled={saving}
      >
        {saving ? <CircularProgress size={24} /> : 'Αποθήκευση Αλλαγών'}
      </Button>
      <CancelTopRightButton onClick={onCancel}>Ακύρωση</CancelTopRightButton>
    </Stack>
  );
}
