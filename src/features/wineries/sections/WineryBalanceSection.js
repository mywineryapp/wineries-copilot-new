// src/features/wineries/sections/WineryBalanceSection.js

import React from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress
} from '@mui/material';

// Μικρή βοηθητική συνάρτηση για τα νούμερα
const formatCurrency = (num) => {
    if (typeof num !== 'number') return '-';
    return num.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Αυτό το component είναι πλέον "χαζό". Απλά παίρνει τα δεδομένα και τα δείχνει.
export default function WineryBalanceSection({ balanceData, loading }) {

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress />
            </Box>
        );
    }
    
    if (!balanceData) {
        return (
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', border: '1px solid #eee' }}>
                <Typography color="text.secondary">Δεν βρέθηκαν δεδομένα υπολοίπου για αυτό το οινοποιείο.</Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" gutterBottom>
                Ανάλυση Υπολοίπου
            </Typography>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Περίοδος</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Ποσό</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>Σύνολο Υπολοίπου</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{formatCurrency(balanceData.totalBalance)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>0-30 ημέρες</TableCell>
                            <TableCell align="right">{formatCurrency(balanceData.days_0_30)}</TableCell>
                        </TableRow>
                         <TableRow>
                            <TableCell>31-60 ημέρες</TableCell>
                            <TableCell align="right">{formatCurrency(balanceData.days_31_60)}</TableCell>
                        </TableRow>
                         <TableRow>
                            <TableCell>61-90 ημέρες</TableCell>
                            <TableCell align="right">{formatCurrency(balanceData.days_61_90)}</TableCell>
                        </TableRow>
                         <TableRow>
                            <TableCell>91-120 ημέρες</TableCell>
                            <TableCell align="right">{formatCurrency(balanceData.days_91_120)}</TableCell>
                        </TableRow>
                         <TableRow>
                            <TableCell>121-150 ημέρες</TableCell>
                            <TableCell align="right">{formatCurrency(balanceData.days_121_150)}</TableCell>
                        </TableRow>
                         <TableRow>
                            <TableCell>151+ ημέρες</TableCell>
                            <TableCell align="right">{formatCurrency(balanceData.days_151_plus)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}