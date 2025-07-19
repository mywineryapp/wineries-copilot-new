// src/features/wineries/modals/ProductsEditModal.js

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Stack,
    Typography,
    TextField,
    Button, 
    CircularProgress,
    Box,
    MenuItem, 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; 
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'; 

// ❌ Αφαιρέθηκε το CancelTopRightButton
import { ModalActions } from '../../../components/buttons';

import { doc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../../services/firestore';
import { useNotifier } from '../../../context/NotificationContext';


export default function ProductsEditModal({ wineryId, wine, open, onClose, onSaveSuccess, onDeleteProduct }) {
    const { showNotification } = useNotifier();

    const orderedColors = ['Λευκό', 'Κόκκινο', 'Ροζ', 'Κίτρινο', 'Orange']; 

    const [currentWine, setCurrentWine] = useState({
        name: '',
        variety: [],
        capType: '',
        color: '', 
        labelImageURL: '',
    });

    const [labelImageFile, setLabelImageFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formErrors, setFormErrors] = useState({}); 

    useEffect(() => {
        if (open) {
            if (wine) {
                setCurrentWine({
                    name: wine.name || '',
                    variety: wine.variety || [],
                    capType: wine.capType || '',
                    color: wine.color || '', 
                    labelImageURL: wine.labelImageURL || '',
                });
            } else {
                setCurrentWine({
                    name: '',
                    variety: [],
                    capType: '',
                    color: '', 
                    labelImageURL: '',
                });
            }
            setLabelImageFile(null);
            setIsUploading(false);
            setSaving(false);
            setFormErrors({});
        }
    }, [open, wine]);

    const handleChange = (field, value) => {
        setCurrentWine(prev => ({ ...prev, [field]: value }));
    };

    const handleVarietyChange = (e) => {
        const value = e.target.value;
        const varietyArray = value ? value.split(',').map(item => item.trim()) : [];
        handleChange('variety', varietyArray);
    };

    const handleImageFileChange = (e) => {
        if (e.target.files[0]) {
            setLabelImageFile(e.target.files[0]);
            setCurrentWine(prev => ({ ...prev, labelImageURL: URL.createObjectURL(e.target.files[0]) }));
        }
    };

    const handleRemoveImage = () => {
        setCurrentWine(prev => ({ ...prev, labelImageURL: '' }));
        setLabelImageFile(null);
    };

    const validateForm = () => {
        if (!currentWine.name.trim()) {
            showNotification('Το όνομα κρασιού είναι υποχρεωτικό.', 'error');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setSaving(true);
        let finalImageURL = currentWine.labelImageURL;

        try {
            if (labelImageFile) {
                setIsUploading(true);
                if (wine?.labelImageURL && wine.labelImageURL.startsWith('https://firebasestorage.googleapis.com')) {
                    try {
                        const oldImageRef = ref(storage, wine.labelImageURL);
                        await deleteObject(oldImageRef);
                    } catch (deleteErr) {
                        console.warn("Could not delete old image:", deleteErr);
                    }
                }
                const storageRef = ref(storage, `wine_labels/${wineryId}/${Date.now()}_${labelImageFile.name}`);
                await uploadBytes(storageRef, labelImageFile);
                finalImageURL = await getDownloadURL(storageRef);
                setIsUploading(false);
            } else if (!currentWine.labelImageURL && wine?.labelImageURL && wine.labelImageURL.startsWith('https://firebasestorage.googleapis.com')) {
                try {
                    const oldImageRef = ref(storage, wine.labelImageURL);
                    await deleteObject(oldImageRef);
                    finalImageURL = '';
                } catch (deleteErr) {
                     console.warn("Could not delete old image on removal:", deleteErr);
                }
            }

            const wineDataToSave = {
                ...currentWine,
                wineryId: wineryId,
                labelImageURL: finalImageURL,
                updatedAt: serverTimestamp(),
            };

            if (wine) {
                const wineRef = doc(db, 'wines', wine.id);
                await updateDoc(wineRef, wineDataToSave);
                showNotification('Το προϊόν ενημερώθηκε επιτυχώς!', 'success');
            } else {
                wineDataToSave.createdAt = serverTimestamp();
                await addDoc(collection(db, 'wines'), wineDataToSave);
                showNotification('Το νέο προϊόν προστέθηκε επιτυχώς!', 'success');
            }
            onSaveSuccess();
            onClose();
        } catch (err) {
            showNotification(`Σφάλμα κατά την αποθήκευση: ${err.message}`, 'error');
        } finally {
            setSaving(false);
            setIsUploading(false);
        }
    };

    const handleDeleteClick = () => {
        if (wine && onDeleteProduct) {
            onDeleteProduct(wine.id);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="sm" 
            fullWidth
            BackdropProps={{
                style: { backgroundColor: 'rgba(0, 0, 0, 0.7)' } 
            }}
            PaperProps={{ 
                sx: { 
                    backgroundColor: 'white', 
                    borderRadius: 2 
                } 
            }}
        >
            <DialogTitle>
                {wine ? 'Επεξεργασία Προϊόντος' : 'Προσθήκη Νέου Προϊόντος'}
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                    aria-label="Κλείσιμο"
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={3}>
                    <TextField label="Όνομα Κρασιού" value={currentWine.name} onChange={(e) => handleChange('name', e.target.value)} fullWidth required error={!!formErrors.name} helperText={formErrors.name}/>
                    <TextField label="Ποικιλία (χωρίστε με κόμμα)" value={Array.isArray(currentWine.variety) ? currentWine.variety.join(', ') : ''} onChange={handleVarietyChange} fullWidth />
                    <TextField label="Τύπος Πώματος" value={currentWine.capType} onChange={(e) => handleChange('capType', e.target.value)} fullWidth/>
                    <TextField select  label="Χρώμα Κρασιού" value={currentWine.color} onChange={(e) => handleChange('color', e.target.value)} fullWidth>
                        <MenuItem value=""><em>Δεν έχει οριστεί</em></MenuItem>
                        {orderedColors.map((colorOption) => (
                            <MenuItem key={colorOption} value={colorOption}>{colorOption}</MenuItem>
                        ))}
                    </TextField>

                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, bgcolor: '#f9f9f9', border: '1px dashed lightgrey', borderRadius: 1 }}>
                        <Typography variant="subtitle1">Φωτογραφία Ετικέτας</Typography>
                        {currentWine.labelImageURL ? (
                            <Box sx={{ position: 'relative', width: 150, height: 150, border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
                                <img src={currentWine.labelImageURL} alt="Προεπισκόπηση" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                <IconButton size="small" onClick={handleRemoveImage} sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(255, 255, 255, 0.8)', '&:hover': { bgcolor: 'white' } }}>
                                    <DeleteForeverIcon color="error" fontSize="small" />
                                </IconButton>
                            </Box>
                        ) : (
                            <Button component="label" variant="outlined" startIcon={<AddPhotoAlternateIcon />}>
                                Επιλογή Εικόνας <input type="file" hidden accept="image/*" onChange={handleImageFileChange} />
                            </Button>
                        )}
                        {isUploading && (
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <CircularProgress size={20} />
                                <Typography variant="body2">Ανέβασμα εικόνας...</Typography>
                            </Stack> 
                        )}
                    </Box>
                </Stack>
            </DialogContent>

            <DialogContent sx={{ pt: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    {wine && (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteForeverIcon />}
                            onClick={handleDeleteClick} 
                            disabled={saving || isUploading} 
                        >
                            Διαγραφή Προϊόντος
                        </Button>
                    )}
                    <Box sx={{ flexGrow: 1 }} /> 
                    <ModalActions
                        onCancel={onClose}
                        onSave={handleSave}
                        saving={saving || isUploading}
                    />
                </Stack>
            </DialogContent>
        </Dialog>
    );
}