// src/components/features/wineries/sections/WineryProductionSection.js

import React, { useState, useEffect } from 'react';
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
import { collection, getDocs, query, where } from 'firebase/firestore';

import { EditIconButton } from '../../../components/buttons';
import ProductionEditModal from '../modals/ProductionEditModal';
import SalesDetailModal from '../modals/SalesDetailModal';
import { db as firestoreDbInstance } from '../../../services/firestore';

export default function WineryProductionSection({ winery, db, open }) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [salesByYearAggregatedData, setSalesByYearAggregatedData] = useState([]);
    const [allSalesData, setAllSalesData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);

    const handleEdit = () => {
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        fetchSalesData();
    };

    const handleOpenDetailModal = (year) => {
        setSelectedYear(year);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedYear(null);
    };

    const fetchSalesData = async () => {
        setLoading(true);
        try {
            const currentDb = db || firestoreDbInstance;

            if (!winery?.id || !currentDb) {
                console.warn("WineryProductionSection: Winery ID ή σύνδεση βάσης δεδομένων λείπει για ανάκτηση δεδομένων πωλήσεων. Winery ID:", winery?.id);
                setLoading(false);
                setSalesByYearAggregatedData([]);
                setAllSalesData([]);
                return;
            }

            const salesCollectionRef = collection(currentDb, 'sales_by_year');
            const salesQuery = query(salesCollectionRef, where('wineryId', '==', winery.id));
            const salesSnapshot = await getDocs(salesQuery);

            const rawFetchedSalesData = salesSnapshot.docs.map(doc => doc.data());
            setAllSalesData(rawFetchedSalesData);

            const aggregatedSales = rawFetchedSalesData.reduce((acc, sale) => {
                const year = sale.year;
                if (!acc[year]) {
                    acc[year] = {
                        year: year,
                        totalQuantity: 0,
                        totalValue: 0,
                    };
                }
                acc[year].totalQuantity += Number(sale.quantity) || 0;
                acc[year].totalValue += Number(sale.value) || 0;
                return acc;
            }, {});

            const sortedAggregatedSales = Object.values(aggregatedSales).sort((a, b) => {
                return Number(b.year) - Number(a.year);
            });

            setSalesByYearAggregatedData(sortedAggregatedSales);

        } catch (err) {
            console.error('WineryProductionSection: Σφάλμα στη λήψη ή επεξεργασία δεδομένων πωλήσεων:', err);
            setSalesByYearAggregatedData([]);
            setAllSalesData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && winery?.id) {
            fetchSalesData();
        } else {
            setLoading(false);
            setSalesByYearAggregatedData([]);
            setAllSalesData([]);
        }
    }, [open, winery?.id, db]);

    return (
        <Paper
            elevation={0}
            sx={{
                mt: 2,
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
            }}
        >
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={2}
                sx={{ mb: 2 }}
            >
                {/* Αφαίρεση του "Στοιχεία Πωλήσεων CorkHellas" ή αντικατάσταση με πιο γενικό */}
                {/* Μπορείς να το αλλάξεις σε κάτι όπως "Στοιχεία Πωλήσεων" ή "Πωλήσεις" */}
                <Typography variant="h6" sx={{ color: 'text.primary' }}>📈 Στοιχεία Πωλήσεων</Typography> {/* Αλλαγή τίτλου */}
                <EditIconButton onClick={handleEdit} />
            </Stack>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 150 }}>
                    <CircularProgress size={28} />
                </Box>
            ) : (
                <>
                    {/* Αφαίρεση του υποτίτλου "Πατήστε στο Έτος για λεπτομέρειες" */}
                    {/* Η κλικαριστότητα του link στο έτος θα είναι αρκετή οπτικά */}
                    {salesByYearAggregatedData.length > 0 ? (
                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #f0f0f0', borderRadius: 2, overflowX: 'auto', mb: 3 }}>
                            <Table size="small" aria-label="Συγκεντρωτικές Πωλήσεις ανά Έτος">
                                <TableHead sx={{ backgroundColor: '#f9f9f9' }}>
                                    <TableRow>
                                        {/* Μικρότερο minWidth για responsive */}
                                        <TableCell sx={{ fontWeight: 'bold', minWidth: 'auto' }}>Έτος</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', minWidth: 120, textAlign: 'right' }}>Συνολική Ποσότητα</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', minWidth: 100, textAlign: 'right' }}>Συνολική Αξία (€)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {salesByYearAggregatedData.map((data) => (
                                        <TableRow
                                            key={data.year}
                                            sx={{ '&:hover': { backgroundColor: '#f5f5f5', cursor: 'pointer' } }}
                                            onClick={() => handleOpenDetailModal(data.year)}
                                        >
                                            <TableCell>
                                                <Link
                                                    component="button"
                                                    variant="body2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenDetailModal(data.year);
                                                    }}
                                                    sx={{ textDecoration: 'underline', fontWeight: 'bold' }}
                                                >
                                                    {data.year}
                                                </Link>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'right' }}>{data.totalQuantity !== undefined ? data.totalQuantity.toLocaleString('el-GR') : '-'}</TableCell>
                                            <TableCell sx={{ textAlign: 'right' }}>{data.totalValue !== undefined ? data.totalValue.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 1, mb: 3 }}>
                            Δεν υπάρχουν δεδομένα πωλήσεων για αυτό το οινοποιείο. Προσθέστε μέσω του κουμπιού επεξεργασίας.
                        </Typography>
                    )}
                </>
            )}

            <ProductionEditModal
                winery={winery}
                open={isEditModalOpen}
                onClose={handleCloseEditModal}
                db={db || firestoreDbInstance}
                onSaveSuccess={fetchSalesData}
            />

            {selectedYear && (
                <SalesDetailModal
                    open={isDetailModalOpen}
                    onClose={handleCloseDetailModal}
                    year={selectedYear}
                    salesData={allSalesData.filter(sale => sale.year === selectedYear)}
                />
            )}
        </Paper>
    );
}