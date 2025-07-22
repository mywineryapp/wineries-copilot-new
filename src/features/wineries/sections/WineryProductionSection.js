import React, { useState, useEffect, useMemo } from 'react';
import {
    Typography,
    Box,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Link,
} from '@mui/material';
import { EditIconButton } from '../../../components/buttons';
import ProductionEditModal from '../modals/ProductionEditModal';
import SalesDetailModal from '../modals/SalesDetailModal';
import { db as firestoreDbInstance } from '../../../services/firestore';

// ✅✅✅ ΤΩΡΑ ΔΕΧΕΤΑΙ ΤΑ ΔΕΔΟΜΕΝΑ ΩΣ PROPS ✅✅✅
export default function WineryProductionSection({ winery, db, allSalesData, loading }) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // ✅✅✅ Η ΛΟΓΙΚΗ ΕΠΕΞΕΡΓΑΣΙΑΣ ΜΕΤΑΦΕΡΕΤΑΙ ΕΔΩ, ΜΕ ΧΡΗΣΗ useMemo ✅✅✅
    const salesByYearAggregatedData = useMemo(() => {
        if (!allSalesData || allSalesData.length === 0) return [];

        const aggregatedSales = allSalesData.reduce((acc, sale) => {
            const year = sale.year;
            if (!acc[year]) {
                acc[year] = { year, totalQuantity: 0, totalValue: 0 };
            }
            acc[year].totalQuantity += Number(sale.quantity) || 0;
            acc[year].totalValue += Number(sale.value) || 0;
            return acc;
        }, {});

        return Object.values(aggregatedSales).sort((a, b) => Number(b.year) - Number(a.year));
    }, [allSalesData]);

    const handleEdit = () => setIsEditModalOpen(true);
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        // Σημείωση: Η ανανέωση θα γίνεται πλέον από το γονικό component
        // που θα ξανα-φορτώνει τα δεδομένα όταν χρειάζεται.
        // Για τώρα, αυτή η απλή λύση είναι ΟΚ.
    };

    const handleOpenDetailModal = (year) => {
        setSelectedYear(year);
        setIsDetailModalOpen(true);
    };
    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedYear(null);
    };

    return (
        <Paper elevation={0} sx={{ mt: 2, p: { xs: 2, sm: 3 }, borderRadius: 2, backgroundColor: 'white', border: '1px solid #e0e0e0' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'text.primary' }}>📈 Στοιχεία Πωλήσεων</Typography>
                <EditIconButton onClick={handleEdit} />
            </Stack>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 150 }}>
                    <CircularProgress size={28} />
                </Box>
            ) : (
                <>
                    {salesByYearAggregatedData.length > 0 ? (
                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #f0f0f0', borderRadius: 2, overflowX: 'auto', mb: 3 }}>
                            <Table size="small">
                                <TableHead sx={{ backgroundColor: '#f9f9f9' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Έτος</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Συνολική Ποσότητα</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Συνολική Αξία (€)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {salesByYearAggregatedData.map((data) => (
                                        <TableRow key={data.year} hover sx={{ cursor: 'pointer' }} onClick={() => handleOpenDetailModal(data.year)}>
                                            <TableCell>
                                                <Link component="button" variant="body2" onClick={(e) => { e.stopPropagation(); handleOpenDetailModal(data.year); }} sx={{ fontWeight: 'bold' }}>
                                                    {data.year}
                                                </Link>
                                            </TableCell>
                                            <TableCell align="right">{data.totalQuantity.toLocaleString('el-GR')}</TableCell>
                                            <TableCell align="right">{data.totalValue.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography variant="body2" color="text.secondary">Δεν υπάρχουν δεδομένα πωλήσεων. Πατήστε επεξεργασία για να προσθέσετε.</Typography>
                    )}
                </>
            )}

            <ProductionEditModal
                winery={winery}
                open={isEditModalOpen}
                onClose={handleCloseEditModal}
                db={db || firestoreDbInstance}
                onSaveSuccess={() => { /* Η ανανέωση γίνεται από το γονικό */ }}
            />

            {selectedYear && (
                <SalesDetailModal
                    open={isDetailModalOpen}
                    onClose={handleCloseDetailModal}
                    year={selectedYear}
                    salesData={allSalesData}
                />
            )}
        </Paper>
    );
}