import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography
} from '@mui/material';

// Βοηθητικές συναρτήσεις
const formatCurrency = (num) => {
    if (typeof num !== 'number') return '-';
    return num.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' });
};

export default function InvoiceDetailsModal({ open, onClose, invoiceGroup }) {
    if (!invoiceGroup) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                Λεπτομέρειες Τιμολογίων για: {invoiceGroup.wineryName}
                <Typography variant="body2" color="text.secondary">
                    Ημερομηνία: {invoiceGroup.date}
                </Typography>
            </DialogTitle>
            <DialogContent dividers>
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Περιγραφή Είδους</TableCell>
                                <TableCell>Φιάλη</TableCell>
                                <TableCell>Οίνος</TableCell>
                                <TableCell align="right">Ποσότητα</TableCell>
                                <TableCell align="right">Τιμή Μονάδος</TableCell>
                                <TableCell>Σημειώσεις</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {invoiceGroup.items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell sx={{fontWeight: 'medium'}}>{item.productDescription || '-'}</TableCell>
                                    <TableCell>{item.bottleInfo || '-'}</TableCell>
                                    <TableCell>{item.wineInfo || '-'}</TableCell>
                                    <TableCell align="right">{item.quantity || 0}</TableCell>
                                    <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                                    <TableCell>{item.notes || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Κλείσιμο</Button>
            </DialogActions>
        </Dialog>
    );
}