// src/components/features/wineries/modals/SalesDetailModal.js

import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
} from '@mui/material';

import { CancelTopRightButton } from '../../../components/buttons';

export default function SalesDetailModal({ open, onClose, year, salesData }) {
    // Φιλτράρουμε τα salesData που μας έρχονται από το WineryProductionSection
    // για να είμαστε σίγουροι ότι εμφανίζουμε μόνο αυτά του επιλεγμένου έτους
    const filteredSales = salesData.filter(sale => sale.year === year);

    // Ταξινόμηση των αναλυτικών πωλήσεων ανά προϊόν
    filteredSales.sort((a, b) => (a.product || '').localeCompare(b.product || ''));

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    backgroundColor: 'white',
                    borderRadius: 2,
                    boxShadow: 'none',
                    border: '1px solid #e0e0e0',
                }
            }}
            BackdropProps={{
                style: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)'
                }
            }}
        >
            <DialogTitle sx={{ pb: 1, position: 'relative', backgroundColor: 'white' }} variant="h6">
                Αναλυτικές Πωλήσεις για το Έτος {year}
                <CancelTopRightButton onClick={onClose} />
            </DialogTitle>

            <DialogContent dividers sx={{ p: 2, backgroundColor: 'white' }}>
                {filteredSales.length > 0 ? (
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #f0f0f0', borderRadius: 2, overflowX: 'auto' }}>
                        <Table size="small" aria-label={`Αναλυτικές Πωλήσεις για το Έτος ${year}`}>
                            <TableHead sx={{ backgroundColor: '#f9f9f9' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', minWidth: 150 }}>Προϊόν</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', minWidth: 100, textAlign: 'right' }}>Ποσότητα</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', minWidth: 100, textAlign: 'right' }}>Αξία (€)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredSales.map((sale, index) => (
                                    // Χρησιμοποιούμε sale.id ως key, ή index αν δεν υπάρχει για νέα δεδομένα
                                    <TableRow key={sale.id || index}>
                                        <TableCell>{sale.product}</TableCell>
                                        <TableCell sx={{ textAlign: 'right' }}>{sale.quantity !== undefined ? sale.quantity.toLocaleString('el-GR') : '-'}</TableCell>
                                        <TableCell sx={{ textAlign: 'right' }}>{sale.value !== undefined ? sale.value.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 1 }}>
                        Δεν βρέθηκαν αναλυτικά δεδομένα πωλήσεων για το έτος {year}.
                    </Typography>
                )}
            </DialogContent>
        </Dialog>
    );
}