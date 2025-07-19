// src/features/balances/BalanceUploadModal.js

import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography,
    CircularProgress, Alert
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { styled } from '@mui/material/styles';
import { useNotifier } from '../../context/NotificationContext';
import { ref, uploadBytes } from "firebase/storage";
import { storage } from '../../services/firestore';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function BalanceUploadModal({ open, onClose }) {
    const { showNotification } = useNotifier();
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            // ✅✅✅ ΑΛΛΑΓΗ: Τώρα ελέγχουμε για Excel ✅✅✅
            if (file.name.toLowerCase().endsWith('.xls') || file.name.toLowerCase().endsWith('.xlsx')) {
                 setSelectedFile(file);
            } else {
                 showNotification('Παρακαλώ επιλέξτε αρχείο μορφής Excel (.xls, .xlsx).', 'error');
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            showNotification('Δεν έχετε επιλέξει αρχείο.', 'warning');
            return;
        }

        setLoading(true);
        try {
            const storageRef = ref(storage, `balance-sheets/${new Date().toISOString()}-${selectedFile.name}`);
            await uploadBytes(storageRef, selectedFile);
            showNotification('Το αρχείο ανέβηκε! Η ενημέρωση θα ξεκινήσει αυτόματα.', 'success');
            onClose();
        } catch (error) {
            console.error("File upload error:", error);
            showNotification(`Το ανέβασμα απέτυχε: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Μαζική Ενημέρωση Υπολοίπων</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="body1">
                        Επιλέξτε το αρχείο **Excel** με τα ενημερωμένα υπόλοιπα.
                    </Typography>
                     <Typography variant="caption" color="text.secondary">
                        Η πρώτη γραμμή του αρχείου μπορεί να περιέχει τους τίτλους των στηλών.
                    </Typography>
                    
                    <Button component="label" role={undefined} variant="contained" tabIndex={-1} startIcon={<UploadFileIcon />}>
                        Επιλογή Αρχείου Excel
                        {/* ✅✅✅ ΑΛΛΑΓΗ: Τώρα δέχεται .xls, .xlsx ✅✅✅ */}
                        <VisuallyHiddenInput type="file" onChange={handleFileChange} accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
                    </Button>
                    
                    {selectedFile && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            Επιλεγμένο αρχείο: <strong>{selectedFile.name}</strong>
                        </Alert>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Ακύρωση</Button>
                <Button onClick={handleUpload} variant="contained" disabled={!selectedFile || loading}>
                    {loading ? <CircularProgress size={24} /> : 'Ενημέρωση'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}