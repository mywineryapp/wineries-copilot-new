import React, { useState, useMemo } from 'react';
import { Box, Paper, CircularProgress, Alert, Backdrop } from '@mui/material';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../services/firestore';
import { useModal } from '../../context/ModalContext';
import { useCustomerBalances } from './hooks/useCustomerBalances'; // ✅ Το νέο hook
import BalanceToolbar from './components/BalanceToolbar'; // ✅ Το νέο component
import BalanceTable from './components/BalanceTable';   // ✅ Το νέο component

// ✅ Η λογική φιλτραρίσματος σε ξεχωριστή, "καθαρή" συνάρτηση
const filterBalances = (balances, filters) => {
    let filtered = balances;

    if (filters.showOverdueOnly) {
        filtered = filtered.filter(balance => {
            const overdueAmount = (balance.days_61_90 || 0) + (balance.days_91_120 || 0) + (balance.days_121_150 || 0) + (balance.days_151_plus || 0);
            return overdueAmount >= 50;
        });
    }

    if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(balance =>
            balance.customerName?.toLowerCase().includes(term) ||
            balance.customerId?.toLowerCase().includes(term)
        );
    }
    return filtered;
};


export default function BalanceReportPage() {
    const { showModal } = useModal();
    const { balances, loading, error } = useCustomerBalances(); // ✅ Φορτώνουμε τα δεδομένα
    const [filters, setFilters] = useState({ searchTerm: '', showOverdueOnly: false });
    const [modalLoading, setModalLoading] = useState(false);

    // ✅ Χρησιμοποιούμε useMemo για απόδοση
    const filteredBalances = useMemo(() => filterBalances(balances, filters), [balances, filters]);

    const handleRowClick = async (winery) => {
        setModalLoading(true);
        try {
            const q = query(
                collection(db, 'communications'),
                where('wineryId', '==', winery.customerId),
                where('isClosed', '==', false),
                limit(1)
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const existingComm = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
                showModal('COMMUNICATION_EDIT', { communication: existingComm });
            } else {
                showModal('COMMUNICATION_EDIT', { 
                    wineryId: winery.customerId, 
                    wineryName: winery.customerName 
                });
            }
        } catch (err) {
            alert("Σφάλμα κατά την αναζήτηση ανοιχτής επικοινωνίας.");
        } finally {
            setModalLoading(false);
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>;
    }
    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <>
            <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={modalLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>

            <Paper sx={{ p: 3, width: '100%', borderRadius: 2 }}>
                <BalanceToolbar filters={filters} setFilters={setFilters} />
                <BalanceTable balances={filteredBalances} onRowClick={handleRowClick} />
            </Paper>
        </>
    );
}