import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

const formatCurrency = (num) => {
    if (typeof num !== 'number' || num === 0) return '-';
    return num.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' });
};

export default function BalanceTable({ balances, onRowClick }) {
    if (balances.length === 0) {
        return <Typography sx={{ textAlign: 'center', mt: 4, p: 3 }}>Δεν βρέθηκαν αποτελέσματα.</Typography>;
    }

    return (
        <TableContainer>
            <Table stickyHeader size="small">
                <TableHead>
                    <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: 'grey.100' } }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Επωνυμία</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Υπόλοιπο</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>0-30</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>31-60</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>61-90</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>91-120</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>121-150</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>151+</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {balances.map((row) => (
                        <TableRow hover key={row.id} onClick={() => onRowClick(row)} sx={{ cursor: 'pointer' }}>
                            <TableCell sx={{ fontWeight: 'medium', color: 'primary.main' }}>{row.customerName}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{formatCurrency(row.totalBalance)}</TableCell>
                            <TableCell align="right">{formatCurrency(row.days_0_30)}</TableCell>
                            <TableCell align="right">{formatCurrency(row.days_31_60)}</TableCell>
                            <TableCell align="right" sx={{ color: '#B71C1C', fontWeight: 'bold' }}>{formatCurrency(row.days_61_90)}</TableCell>
                            <TableCell align="right" sx={{ color: '#B71C1C', fontWeight: 'bold' }}>{formatCurrency(row.days_91_120)}</TableCell>
                            <TableCell align="right" sx={{ color: '#B71C1C', fontWeight: 'bold' }}>{formatCurrency(row.days_121_150)}</TableCell>
                            <TableCell align="right" sx={{ color: '#B71C1C', fontWeight: 'bold' }}>{formatCurrency(row.days_151_plus)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}