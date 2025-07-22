import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, IconButton, Typography,
    TextField, Button, FormControl, InputLabel, OutlinedInput,
    InputAdornment, Checkbox, FormControlLabel, Paper, CircularProgress,
    Box, Stack, Fade, DialogActions, DialogContentText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { el } from 'date-fns/locale';
import { addDoc, doc, updateDoc, collection, serverTimestamp, deleteDoc } from 'firebase/firestore';

import { db } from '../../../services/firestore';
import { useNotifier } from '../../../context/NotificationContext';
import FirestoreAutocomplete from '../../../components/FirestoreAutocomplete';

const initialProductState = {
    tempId: `product_${Date.now()}`,
    quantity: 1, closureTypeId: null, bottleTypeId: null, bottleCompanyIds: [],
    wineTypeId: '', printingType: 'Ατύπωτα', notes: '', deliveryDate: null,
};

export default function OrderEditModal({ open, onClose, order, wineryId, onSaveSuccess }) {
    const { showNotification } = useNotifier();
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);

    const [orderData, setOrderData] = useState({
        wineryId: '', wineryName: '', orderDate: new Date(), products: [initialProductState],
    });

    useEffect(() => {
        if (open) {
            if (order) {
                setOrderData({
                    id: order.id,
                    wineryId: order.wineryId,
                    wineryName: order.wineryName || '',
                    orderDate: order.orderDate?.toDate ? order.orderDate.toDate() : new Date(),
                    products: order.products.map((p, index) => ({
                        ...p, tempId: `product_${index}`,
                        deliveryDate: p.deliveryDate?.toDate() || null
                    })) || [{ ...initialProductState, tempId: `product_${Date.now()}` }],
                });
            } else {
                setOrderData({
                    wineryId: wineryId || '',
                    wineryName: '',
                    orderDate: new Date(),
                    products: [{ ...initialProductState, tempId: `product_${Date.now()}` }],
                });
            }
        }
    }, [open, order, wineryId]);

    const handleOrderDataChange = (field, value) =>
        setOrderData(prev => ({ ...prev, [field]: value }));

    const handleWineryChange = (id, option) => {
        setOrderData(prev => ({
            ...prev,
            wineryId: id || '',
            wineryName: option?.name || ''
        }));
    };

    const updateProductField = (index, field, value) => {
        setOrderData(prev => {
            const updatedProducts = [...prev.products];
            updatedProducts[index] = { ...updatedProducts[index], [field]: value };
            return { ...prev, products: updatedProducts };
        });
    };

    const handleQuantityChange = (index, increment) => {
        const currentQuantity = Number(orderData.products[index].quantity) || 0;
        const newQuantity = currentQuantity + increment;
        updateProductField(index, 'quantity', Math.max(0, newQuantity));
    };

    const handleAddProduct = () => {
        setOrderData(prev => ({
            ...prev,
            products: [...prev.products, { ...initialProductState, tempId: `product_${Date.now()}` }]
        }));
    };

    const handleDeleteProduct = (index) => {
        if (orderData.products.length <= 1) {
            showNotification('Δεν μπορείτε να διαγράψετε το τελευταίο προϊόν.', 'warning');
            return;
        }
        setOrderData(prev => ({
            ...prev,
            products: prev.products.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        if (!orderData.wineryId || !orderData.wineryName) {
            showNotification('Το οινοποιείο είναι απαραίτητο.', 'error');
            return;
        }
        setSaving(true);
        try {
            const productsToSave = orderData.products.map(({ tempId, ...rest }) => rest);
            const dataToSave = {
                ...orderData,
                products: productsToSave,
                updatedAt: serverTimestamp(),
                wineryName: orderData.wineryName,
            };

            if (orderData.id) {
                await updateDoc(doc(db, 'orders', orderData.id), dataToSave);
                showNotification('Η παραγγελία ενημερώθηκε!', 'success');
            } else {
                delete dataToSave.id;
                dataToSave.createdAt = serverTimestamp();
                await addDoc(collection(db, 'orders'), dataToSave);
                showNotification('Η παραγγελία δημιουργήθηκε!', 'success');
            }
            onSaveSuccess && onSaveSuccess();
            onClose();
        } catch (err) {
            showNotification(`Σφάλμα αποθήκευσης: ${err.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteOrder = async () => {
        setDeleting(true);
        try {
            await deleteDoc(doc(db, 'orders', orderData.id));
            showNotification('Η παραγγελία διαγράφηκε.', 'info');
            onSaveSuccess && onSaveSuccess();
            onClose();
        } catch (err) {
            showNotification(`Σφάλμα διαγραφής: ${err.message}`, 'error');
        } finally {
            setDeleting(false);
            setOpenConfirmDeleteDialog(false);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={el}>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { maxWidth: 600, borderRadius: 4, mx: 1 } }}
            >
                <DialogTitle sx={{
                    pb: 1, position: 'relative', fontWeight: 700, fontSize: 20
                }}>
                    {order ? 'Επεξεργασία Παραγγελίας' : 'Δημιουργία Νέας Παραγγελίας'}
                    <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <CloseIcon fontSize="medium" />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#fafcff" }}>
                    {/* Βασικά στοιχεία */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            mb: 3,
                            bgcolor: "#fff",
                            border: '1px solid #e4e9f0'
                        }}
                    >
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Box sx={{ flex: 1 }}>
                                <FirestoreAutocomplete
                                    collectionName="wineries"
                                    label="Οινοποιείο"
                                    value={orderData.wineryId}
                                    onChange={handleWineryChange}
                                />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <DatePicker
                                    label="Ημερομηνία Παραγγελίας"
                                    format="dd/MM/yyyy"
                                    value={orderData.orderDate}
                                    onChange={date => handleOrderDataChange('orderDate', date)}
                                    slotProps={{
                                        textField: { fullWidth: true, size: 'small', variant: 'outlined' }
                                    }}
                                />
                            </Box>
                        </Stack>
                    </Paper>
                    {/* Προϊόντα */}
                    <Stack spacing={2}>
                        {orderData.products.map((product, index) => (
                            <Paper
                                key={product.tempId}
                                elevation={0}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    border: '1px solid #e4e9f0',
                                    bgcolor: "#fff",
                                    mb: 1,
                                    position: 'relative'
                                }}
                            >
                                <IconButton
                                    onClick={() => handleDeleteProduct(index)}
                                    size="small"
                                    sx={{
                                        position: 'absolute', right: 8, top: 8,
                                        bgcolor: 'rgba(255,0,0,0.07)',
                                        '&:hover': { bgcolor: 'rgba(255,0,0,0.16)' }
                                    }}>
                                    <DeleteIcon color="error" fontSize="small" />
                                </IconButton>
                                <Stack spacing={2}>
                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                        <Box sx={{ flex: 1 }}>
                                            <FormControl fullWidth size="small" variant="outlined">
                                                <InputLabel>Ποσότητα</InputLabel>
                                                <OutlinedInput
                                                    type="number"
                                                    value={product.quantity || ''}
                                                    onChange={e => updateProductField(index, 'quantity', e.target.value)}
                                                    startAdornment={
                                                        <InputAdornment position="start">
                                                            <IconButton size="small" onClick={() => handleQuantityChange(index, -1)}>
                                                                <RemoveIcon fontSize="small" />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    }
                                                    endAdornment={
                                                        <InputAdornment position="end">
                                                            <IconButton size="small" onClick={() => handleQuantityChange(index, 1)}>
                                                                <AddIcon fontSize="small" />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    }
                                                    label="Ποσότητα"
                                                />
                                            </FormControl>
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <FirestoreAutocomplete
                                                collectionName="closureTypes"
                                                label="Πώμα"
                                                value={product.closureTypeId}
                                                onChange={id => updateProductField(index, 'closureTypeId', id)}
                                            />
                                        </Box>
                                    </Stack>
                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                        <Box sx={{ flex: 1 }}>
                                            <FirestoreAutocomplete
                                                collectionName="bottleTypes"
                                                label="Τύπος Φιάλης"
                                                value={product.bottleTypeId}
                                                onChange={id => updateProductField(index, 'bottleTypeId', id)}
                                            />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <FirestoreAutocomplete
                                                collectionName="bottleCompanies"
                                                label="Εταιρεία Φιάλης"
                                                value={product.bottleCompanyIds}
                                                onChange={ids => updateProductField(index, 'bottleCompanyIds', ids)}
                                                multiple
                                            />
                                        </Box>
                                    </Stack>
                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                        <Box sx={{ flex: 1 }}>
                                            <TextField
                                                fullWidth
                                                label="Κρασί"
                                                value={product.wineTypeId}
                                                onChange={e => updateProductField(index, 'wineTypeId', e.target.value)}
                                                variant="outlined" size="small"
                                            />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <DatePicker
                                                label="Ημ/νία Παράδοσης Προϊόντος"
                                                format="dd/MM/yyyy"
                                                value={product.deliveryDate}
                                                onChange={date => updateProductField(index, 'deliveryDate', date)}
                                                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                                            />
                                        </Box>
                                    </Stack>
                                    <TextField
                                        fullWidth
                                        label="Σημειώσεις"
                                        value={product.notes}
                                        onChange={e => updateProductField(index, 'notes', e.target.value)}
                                        multiline rows={2}
                                        variant="outlined" size="small"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={product.printingType === 'Τυπωμένα'}
                                                onChange={e => updateProductField(index, 'printingType', e.target.checked ? 'Τυπωμένα' : 'Ατύπωτα')}
                                            />
                                        }
                                        label="Τυπωμένα"
                                        sx={{ whiteSpace: 'nowrap', ml: 1.5 }}
                                    />
                                </Stack>
                            </Paper>
                        ))}
                        <Button
                            startIcon={<AddIcon />}
                            onClick={handleAddProduct}
                            variant="contained"
                            size="large"
                            color="primary"
                            sx={{ mt: 2, borderRadius: 2, fontWeight: 600, alignSelf: "center", width: { xs: '100%', sm: 'auto' } }}
                        >
                            Προσθήκη Προϊόντος
                        </Button>
                    </Stack>
                </DialogContent>
                {/* Actions */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        px: { xs: 2, sm: 2 },
                        py: 2,
                        bgcolor: "#fff",
                        borderTop: "1px solid #e0e0e0"
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        size="large"
                        sx={{ minWidth: 120 }}
                    >Ακύρωση</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={saving || deleting}
                        size="large"
                        sx={{ minWidth: 140, fontWeight: 600 }}
                    >Αποθήκευση</Button>
                    {orderData.id && (
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => setOpenConfirmDeleteDialog(true)}
                            disabled={deleting}
                            size="large"
                            sx={{ minWidth: 120 }}
                        >Διαγραφή</Button>
                    )}
                </Box>
                {/* Επιβεβαίωση διαγραφής */}
                <Dialog open={openConfirmDeleteDialog} onClose={() => setOpenConfirmDeleteDialog(false)}>
                    <DialogTitle>Επιβεβαίωση Διαγραφής</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Είστε σίγουροι ότι θέλετε να διαγράψετε οριστικά αυτή την παραγγελία;
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenConfirmDeleteDialog(false)} disabled={deleting}>Ακύρωση</Button>
                        <Button onClick={handleDeleteOrder} color="error" disabled={deleting}>
                            {deleting ? <CircularProgress size={20} /> : 'Διαγραφή'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Dialog>
        </LocalizationProvider>
    );
}
