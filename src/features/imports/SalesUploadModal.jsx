import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, LinearProgress, Alert } from '@mui/material';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// ❌ Δεν χρειαζόμαστε πλέον το httpsCallable
import { storage } from '../../services/firestore';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNotifier } from '../../context/NotificationContext';

export default function SalesUploadModal({ open, onClose }) {
    const { showNotification } = useNotifier();
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && (selectedFile.name.toLowerCase().endsWith('.xlsx') || selectedFile.name.toLowerCase().endsWith('.xls'))) {
            setFile(selectedFile);
        } else {
            showNotification('Παρακαλώ επιλέξτε αρχείο μορφής Excel (.xlsx, .xls).', 'error');
        }
    };

    const handleUpload = () => {
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);
        const storageRef = ref(storage, `sales-uploads/${Date.now()}-${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                // Αυτό είναι το πραγματικό σφάλμα, αν αποτύχει το ανέβασμα
                showNotification(`Η μεταφόρτωση απέτυχε: ${error.message}`, 'error');
                setIsUploading(false);
            },
            () => {
                // ✅✅✅ Η ΔΙΟΡΘΩΣΗ ΕΙΝΑΙ ΕΔΩ ✅✅✅
                // Μόλις το ανέβασμα ολοκληρωθεί, απλά ενημερώνουμε και κλείνουμε.
                // Δεν καλούμε καμία Cloud Function από εδώ.
                showNotification('Το αρχείο ανέβηκε επιτυχώς! Η επεξεργασία θα γίνει στο παρασκήνιο.', 'success');
                handleClose();
            }
        );
    };
    
    const resetState = () => {
        setFile(null);
        setUploadProgress(0);
        setIsUploading(false);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Εισαγωγή Πωλήσεων από Excel</DialogTitle>
            <DialogContent>
                <Alert severity="info" sx={{mb: 2}}>
                    Επιλέξτε το αρχείο Excel (.xlsx). Η επεξεργασία μπορεί να διαρκέσει μερικά λεπτά.
                </Alert>
                <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    sx={{ width: '100%', py: 2 }}
                >
                    Επιλογή Αρχείου Excel
                    <input type="file" hidden accept=".xlsx,.xls" onChange={handleFileChange} />
                </Button>
                {file && <Typography sx={{ mt: 2, textAlign: 'center' }}>{file.name}</Typography>}
                {isUploading && (
                    <Box sx={{ width: '100%', mt: 2 }}>
                        <LinearProgress variant="determinate" value={uploadProgress} />
                        <Typography sx={{textAlign: 'center', mt: 1}}>{`Μεταφόρτωση... ${Math.round(uploadProgress)}%`}</Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={isUploading}>Ακύρωση</Button>
                <Button 
                    onClick={handleUpload} 
                    variant="contained" 
                    disabled={!file || isUploading}
                >
                    {isUploading ? 'Μεταφόρτωση...' : 'Έναρξη Εισαγωγής'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}