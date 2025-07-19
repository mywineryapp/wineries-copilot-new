// src/features/balances/BalanceReportPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Alert,
    Stack, FormControlLabel, Switch, TextField, InputAdornment, Backdrop
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { collection, onSnapshot, query, orderBy, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../services/firestore';
import { useModal } from '../../context/ModalContext';

const formatCurrency = (num) => {
    if (typeof num !== 'number' || num === 0) return '-';
    return num.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' });
};

export default function BalanceReportPage() {
    const { showModal } = useModal();
    const [allBalances, setAllBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showOverdueOnly, setShowOverdueOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'customer_balances'), orderBy('customerName', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedBalances = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllBalances(fetchedBalances);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching balance report:", err);
            setError("Σφάλμα ανάκτησης δεδομένων υπολοίπων.");
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredBalances = useMemo(() => {
        let balances = allBalances;
        if (showOverdueOnly) {
            balances = balances.filter(balance => {
                const overdueAmount = (balance.days_61_90 || 0) + (balance.days_91_120 || 0) + (balance.days_121_150 || 0) + (balance.days_151_plus || 0);
                return overdueAmount >= 50;
            });
        }
        if (searchTerm) {
            balances = balances.filter(balance =>
                balance.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                balance.customerId.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return balances;
    }, [allBalances, showOverdueOnly, searchTerm]);

    const handleRowClick = async (winery) => {
        setIsSearching(true);
        try {
            const commsRef = collection(db, 'communications');
            const q = query(commsRef, where('wineryId', '==', winery.customerId), where('isClosed', '==', false), limit(1));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const existingComm = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
                showModal('COMMUNICATION_EDIT', { communication: existingComm });
            } else {
                showModal('COMMUNICATION_EDIT', { wineryId: winery.customerId, wineryName: winery.customerName });
            }
        } catch (err) {
            console.error("Error finding open communication:", err);
            alert("Σφάλμα κατά την αναζήτηση ανοιχτής επικοινωνίας.");
        } finally {
            setIsSearching(false);
        }
    };

    if (loading) { return <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>; }
    if (error) { return <Alert severity="error">{error}</Alert>; }

    const columns = [
        { id: 'customerName', label: 'Επωνυμία' },
        { id: 'totalBalance', label: 'Υπόλοιπο', align: 'right' },
        { id: 'days_0_30', label: '0-30', align: 'right' }, { id: 'days_31_60', label: '31-60', align: 'right' },
        { id: 'days_61_90', label: '61-90', align: 'right' }, { id: 'days_91_120', label: '91-120', align: 'right' },
        { id: 'days_121_150', label: '121-150', align: 'right' }, { id: 'days_151_plus', label: '151+', align: 'right' },
    ];

    return (
        <>
            <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isSearching}>
                <CircularProgress color="inherit" />
            </Backdrop>

            <Paper sx={{ p: 3, width: '100%', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold' }}>Υπόλοιπα Πελατών</Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <TextField
                            placeholder="Αναζήτηση..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            size="small"
                            InputProps={{ startAdornment: ( <InputAdornment position="start"><SearchIcon /></InputAdornment> ), }}
                        />
                        <FormControlLabel
                            control={<Switch checked={showOverdueOnly} onChange={(e) => setShowOverdueOnly(e.target.checked)} color="primary" />}
                            label="Καθυστερήσεις" sx={{ color: 'primary.main', fontWeight: 'medium' }}
                        />
                    </Stack>
                </Stack>
                
                <TableContainer sx={{ border: '1px solid #eee', borderRadius: 2 }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: 'grey.50', borderBottom: '2px solid #ddd' } }}>
                                {columns.map((column) => (
                                    <TableCell key={column.id} align={column.align} sx={{ fontWeight: '600' }}>
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredBalances.map((row) => (
                                <TableRow hover key={row.id} onClick={() => handleRowClick(row)} sx={{ cursor: 'pointer', '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                                    {/* ✅✅✅ Η ΑΛΛΑΓΗ ΕΙΝΑΙ ΕΔΩ ✅✅✅ */}
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
                 {filteredBalances.length === 0 && !loading && (
                    <Typography sx={{ textAlign: 'center', mt: 4, p: 3 }}>Δεν βρέθηκαν αποτελέσματα.</Typography>
                )}
            </Paper>
        </>
    );
}