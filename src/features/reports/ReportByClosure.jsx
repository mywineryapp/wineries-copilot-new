import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, FormControl, InputLabel,
  Select, MenuItem, CircularProgress, Table,
  TableContainer, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../services/firestore';
import { useReferences } from '../../context/ReferenceContext';
import { useModal } from '../../context/ModalContext';

export default function ReportByClosure() {
    const { showModal } = useModal();
    // Παίρνουμε τις λίστες προϊόντων από τη "Βιβλιοθήκη"
    const { closureTypes, loading: refsLoading } = useReferences();
    
    const [orders, setOrders] = useState([]);
    const [wineriesMap, setWineriesMap] = useState({});
    const [loadingData, setLoadingData] = useState(true);
    const [selectedClosure, setSelectedClosure] = useState('');

    useEffect(() => {
        let loadsCompleted = 0;
        const totalLoads = 2;
        const checkAllLoaded = () => {
            loadsCompleted++;
            if (loadsCompleted === totalLoads) setLoadingData(false);
        };

        const qOrders = query(collection(db, 'orders'));
        const unsubOrders = onSnapshot(qOrders, (snapshot) => {
            setOrders(snapshot.docs.map(doc => doc.data()));
            checkAllLoaded();
        });

        const qWineries = query(collection(db, 'wineries'));
        const unsubWineries = onSnapshot(qWineries, (snapshot) => {
            setWineriesMap(snapshot.docs.reduce((acc, doc) => ({ ...acc, [doc.id]: doc.data().name }), {}));
            checkAllLoaded();
        });
        
        return () => { unsubOrders(); unsubWineries(); };
    }, []);
    
    // Απλή και καθαρή λογική φιλτραρίσματος
    const filteredWineryIds = useMemo(() => {
        if (!selectedClosure) return [];

        const wineryIds = new Set();
        for (const order of orders) {
            if (order && Array.isArray(order.products)) {
                if (order.products.some(p => p.closureTypeId === selectedClosure)) {
                    wineryIds.add(order.wineryId);
                }
            }
        }
        return Array.from(wineryIds);
    }, [orders, selectedClosure]);

    const handleOpenWineryModal = (wineryId) => {
        const winery = { id: wineryId, name: wineriesMap[wineryId] || 'Άγνωστο Οινοποιείο' };
        showModal('WINERY_PROFILE', { winery });
    };

    const isLoading = loadingData || refsLoading;

    return (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>Αναζήτηση Οινοποιείων ανά Πώμα</Typography>
            <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                <InputLabel>Επιλέξτε Πώμα</InputLabel>
                <Select value={selectedClosure} label="Επιλέξτε Πώμα" onChange={(e) => setSelectedClosure(e.target.value)}>
                    <MenuItem value=""><em>-- Κανένα --</em></MenuItem>
                    {closureTypes?.map(item => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
                </Select>
            </FormControl>

            {isLoading ? <CircularProgress /> : (
                <TableContainer component={Paper} variant="outlined">
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
                                        <Typography color="text.secondary">Επιλέξτε ένα πώμα για να δείτε αποτελέσματα.</Typography>
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