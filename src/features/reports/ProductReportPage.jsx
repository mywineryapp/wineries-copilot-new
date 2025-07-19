import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, Grid, FormControl, InputLabel,
  Select, MenuItem, CircularProgress, Alert, Table,
  TableContainer, TableHead, TableRow, TableCell, TableBody, Stack, Divider, Chip
} from '@mui/material';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../services/firestore';
import { useReferences } from '../../context/ReferenceContext';
import { useModal } from '../../context/ModalContext';

export default function ProductReportPage() {
    const { showModal } = useModal();
    const { closureTypes, wines, bottleTypes, bottleCompanies, loading: refsLoading } = useReferences();
    
    const [sales, setSales] = useState([]);
    const [allWines, setAllWines] = useState([]);
    const [wineriesMap, setWineriesMap] = useState({});
    const [loadingData, setLoadingData] = useState(true);

    const [selectedClosure, setSelectedClosure] = useState('');
    const [selectedBottleType, setSelectedBottleType] = useState('');
    const [selectedBottleCo, setSelectedBottleCo] = useState('');
    const [selectedWineName, setSelectedWineName] = useState('');
    const [selectedWineColor, setSelectedWineColor] = useState('');
    const [selectedWineVariety, setSelectedWineVariety] = useState('');

    useEffect(() => {
        let loadsCompleted = 0;
        const totalLoads = 3;
        const checkAllLoaded = () => {
            loadsCompleted++;
            if (loadsCompleted === totalLoads) setLoadingData(false);
        };

        const qSales = query(collection(db, 'sales_by_year'));
        const unsubSales = onSnapshot(qSales, (snapshot) => {
            setSales(snapshot.docs.map(doc => doc.data()));
            checkAllLoaded();
        });

        const qWineries = query(collection(db, 'wineries'));
        const unsubWineries = onSnapshot(qWineries, (snapshot) => {
            setWineriesMap(snapshot.docs.reduce((acc, doc) => ({ ...acc, [doc.id]: doc.data().name }), {}));
            checkAllLoaded();
        });

        const qWines = query(collection(db, 'wines'));
        const unsubWines = onSnapshot(qWines, (snapshot) => {
            setAllWines(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
            checkAllLoaded();
        });
        
        return () => { unsubSales(); unsubWineries(); unsubWines(); };
    }, []);
    
    const wineColors = useMemo(() => [...new Set(allWines.map(w => w.color).filter(Boolean))].sort(), [allWines]);
    const wineVarieties = useMemo(() => [...new Set(allWines.flatMap(w => w.variety).filter(Boolean))].sort(), [allWines]);

    const filteredWineryIds = useMemo(() => {
        const filtersActive = selectedClosure || selectedBottleType || selectedBottleCo || selectedWineName || selectedWineColor || selectedWineVariety;
        if (!filtersActive) return [];

        let finalWineryIds = new Set(Object.keys(wineriesMap));

        if (selectedClosure || selectedBottleType || selectedBottleCo) {
            const salesWineryIds = new Set();
            const closureName = closureTypes?.find(c => c.id === selectedClosure)?.name;
            const bottleTypeName = bottleTypes?.find(b => b.id === selectedBottleType)?.name;
            const bottleCoName = bottleCompanies?.find(b => b.id === selectedBottleCo)?.name;

            for (const sale of sales) {
                const matchesClosure = !selectedClosure || sale.product === closureName;
                const matchesBottleType = !selectedBottleType || sale.product === bottleTypeName;
                const matchesBottleCo = !selectedBottleCo || sale.product === bottleCoName;
                
                if (matchesClosure && matchesBottleType && matchesBottleCo) {
                    salesWineryIds.add(sale.wineryId);
                }
            }
            finalWineryIds = new Set([...finalWineryIds].filter(id => salesWineryIds.has(id)));
        }

        if (selectedWineName || selectedWineColor || selectedWineVariety) {
            const wineWineryIds = new Set();
            for (const wine of allWines) {
                const matchesName = !selectedWineName || wine.id === selectedWineName;
                const matchesColor = !selectedWineColor || wine.color === selectedWineColor;
                const matchesVariety = !selectedWineVariety || wine.variety?.includes(selectedWineVariety);

                if(matchesName && matchesColor && matchesVariety) {
                    wineWineryIds.add(wine.wineryId);
                }
            }
            finalWineryIds = new Set([...finalWineryIds].filter(id => wineWineryIds.has(id)));
        }
        
        return Array.from(finalWineryIds);

    }, [sales, allWines, wineriesMap, selectedClosure, selectedBottleType, selectedBottleCo, selectedWineName, selectedWineColor, selectedWineVariety, closureTypes, bottleTypes, bottleCompanies]);

    const handleOpenWineryModal = (wineryId) => {
        const winery = { id: wineryId, name: wineriesMap[wineryId] || 'Άγνωστο Οινοποιείο' };
        showModal('WINERY_PROFILE', { winery });
    };

    const isLoading = loadingData || refsLoading;

    return (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h4" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                Ανάλυση Αγορών & Προϊόντων
            </Typography>
            
            <Divider sx={{my:2}}><Chip label="Αναζήτηση βάσει Αγορών (από Πωλήσεις)" size="small"/></Divider>
            {/* ✅✅✅ Η ΔΙΟΡΘΩΜΕΝΗ ΔΙΑΤΑΞΗ ΜΕ STACK & SCROLL ✅✅✅ */}
            <Box sx={{ overflowX: 'auto', pb: 2 }}>
                <Stack direction="row" spacing={2} sx={{ minWidth: 670 }}>
                    <FormControl size="small" sx={{ flex: 1, minWidth: 210 }}>
                        <InputLabel>Πώμα</InputLabel>
                        <Select value={selectedClosure} label="Πώμα" onChange={(e) => setSelectedClosure(e.target.value)}>
                            <MenuItem value=""><em>-- Κανένα --</em></MenuItem>
                            {closureTypes?.map(item => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ flex: 1, minWidth: 210 }}>
                        <InputLabel>Τύπος Φιάλης</InputLabel>
                        <Select value={selectedBottleType} label="Τύπος Φιάλης" onChange={(e) => setSelectedBottleType(e.target.value)}>
                            <MenuItem value=""><em>-- Κανένας --</em></MenuItem>
                            {bottleTypes?.map(item => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ flex: 1, minWidth: 210 }}>
                        <InputLabel>Εταιρεία Φιάλης</InputLabel>
                        <Select value={selectedBottleCo} label="Εταιρεία Φιάλης" onChange={(e) => setSelectedBottleCo(e.target.value)}>
                           <MenuItem value=""><em>-- Καμία --</em></MenuItem>
                            {bottleCompanies?.map(item => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Stack>
            </Box>

            <Divider sx={{my:2}}><Chip label="Αναζήτηση βάσει Ετικέτας (από Wines)" size="small"/></Divider>
            <Box sx={{ overflowX: 'auto', pb: 2 }}>
                <Stack direction="row" spacing={2} sx={{ minWidth: 670 }}>
                    <FormControl size="small" sx={{ flex: 1, minWidth: 210 }}>
                        <InputLabel>Όνομα Κρασιού</InputLabel>
                        <Select value={selectedWineName} label="Όνομα Κρασιού" onChange={(e) => setSelectedWineName(e.target.value)}>
                            <MenuItem value=""><em>-- Κανένα --</em></MenuItem>
                            {wines?.map(item => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ flex: 1, minWidth: 210 }}>
                        <InputLabel>Χρώμα</InputLabel>
                        <Select value={selectedWineColor} label="Χρώμα" onChange={(e) => setSelectedWineColor(e.target.value)}>
                            <MenuItem value=""><em>-- Κανένα --</em></MenuItem>
                            {wineColors.map(item => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ flex: 1, minWidth: 210 }}>
                        <InputLabel>Ποικιλία</InputLabel>
                        <Select value={selectedWineVariety} label="Ποικιλία" onChange={(e) => setSelectedWineVariety(e.target.value)}>
                            <MenuItem value=""><em>-- Καμία --</em></MenuItem>
                            {wineVarieties.map(item => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Stack>
            </Box>
            
            {isLoading ? <CircularProgress sx={{mt: 2}}/> : (
                <TableContainer component={Paper} variant="outlined" sx={{mt: 3}}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{fontWeight:'bold'}}>Αποτελέσματα ({filteredWineryIds.length} Οινοποιεία)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredWineryIds.length > 0 ? filteredWineryIds.map(wineryId => (
                                <TableRow hover key={wineryId} sx={{cursor: 'pointer'}} onClick={() => handleOpenWineryModal(wineryId)}>
                                    <TableCell sx={{fontWeight: 'medium'}}>{wineriesMap[wineryId] || wineryId}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell>
                                        <Typography color="text.secondary">
                                            { "Επιλέξτε τουλάχιστον ένα φίλτρο." }
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
}