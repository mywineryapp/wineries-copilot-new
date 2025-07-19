import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Alert,
    Button, Stack, IconButton, Tooltip, Chip, Checkbox,
    FormControlLabel, Switch
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../services/firestore';
import { useModal } from '../../context/ModalContext';

const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return '-';
    return timestamp.toDate().toLocaleDateString('el-GR');
};

export default function CommunicationListPage({ wineryFilter }) {
    const { showModal } = useModal();
    const [communications, setCommunications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showOpenOnly, setShowOpenOnly] = useState(true);

    useEffect(() => {
        setLoading(true);
        let q;
        const commsRef = collection(db, 'communications');

        // ✅✅✅ Η ΕΞΥΠΝΑΔΑ ΕΙΝΑΙ ΕΔΩ ✅✅✅
        if (wineryFilter?.id) {
            // Αν μας δώσουν φίλτρο οινοποιείου, το εφαρμόζουμε
            q = query(commsRef, where('wineryId', '==', wineryFilter.id), orderBy('createdAt', 'desc'));
        } else {
            // Αλλιώς, φέρνουμε τα πάντα
            q = query(commsRef, orderBy('createdAt', 'desc'));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCommunications(fetchedData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching communications:", err);
            setError("Σφάλμα ανάκτησης επικοινωνιών.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [wineryFilter]);

    const filteredCommunications = useMemo(() => {
        if (!showOpenOnly) {
            return communications;
        }
        return communications.filter(comm => !comm.isClosed);
    }, [communications, showOpenOnly]);

    const handleOpenModal = (comm = null) => {
        const props = wineryFilter 
            ? { communication: comm, wineryId: wineryFilter.id, wineryName: wineryFilter.name }
            : { communication: comm };
        showModal('COMMUNICATION_EDIT', props);
    };

    if (loading) { return <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>; }
    if (error) { return <Alert severity="error">{error}</Alert>; }

    return (
        // Αν είμαστε σε φιλτραρισμένη προβολή, αλλάζουμε την εμφάνιση
        <Paper sx={{ p: wineryFilter ? 0 : 3, width: '100%', boxShadow: wineryFilter ? 'none' : '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 2, border: wineryFilter ? 'none' : '1px solid #eee' }}>
            <Stack direction={{xs: 'column', sm: 'row'}} justifyContent="space-between" alignItems="center" sx={{ mb: 2, display: wineryFilter ? 'none' : 'flex' }}>
                <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold' }}>Επικοινωνίες</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                    <FormControlLabel control={<Switch checked={showOpenOnly} onChange={(e) => setShowOpenOnly(e.target.checked)} color="primary" />} label={ <Typography sx={{ color: 'primary.main', fontWeight: 'medium' }}>Μόνο Ανοιχτές</Typography> } />
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>Νέα Επικοινωνία</Button>
                </Stack>
            </Stack>
            <TableContainer>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: 'grey.50', borderBottom: '2px solid #ddd' } }}>
                            { !wineryFilter && <TableCell sx={{ fontWeight: '600' }}>Οινοποιείο</TableCell> }
                            <TableCell sx={{ fontWeight: '600' }}>Πωλητής</TableCell>
                            <TableCell sx={{ fontWeight: '600' }}>Σκοπός</TableCell>
                            <TableCell sx={{ fontWeight: '600' }}>Ημ/νία Επαφής</TableCell>
                            <TableCell sx={{ fontWeight: '600' }}>Αποτέλεσμα</TableCell>
                            <TableCell align="center" sx={{ fontWeight: '600' }}>Έκλεισε</TableCell>
                            <TableCell align="right"></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCommunications.map((comm) => (
                            <TableRow hover key={comm.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' }, backgroundColor: comm.isHighPriority ? 'rgba(255, 0, 0, 0.05)' : 'transparent' }}>
                                { !wineryFilter && <TableCell sx={{ fontWeight: 'medium', color: 'primary.main' }}>{comm.wineryName || '-'}</TableCell> }
                                <TableCell>{comm.salespersonName || '-'}</TableCell>
                                <TableCell><Chip label={comm.purposeName || '-'} size="small" variant="outlined" /></TableCell>
                                <TableCell>{formatDate(comm.createdAt)}</TableCell>
                                <TableCell><Tooltip title={comm.result}><Typography variant="body2" noWrap sx={{ maxWidth: '200px' }}>{comm.result || '-'}</Typography></Tooltip></TableCell>
                                <TableCell align="center"><Checkbox checked={comm.isClosed || false} readOnly disabled /></TableCell>
                                <TableCell align="right">
                                    <Stack direction="row" justifyContent="flex-end" alignItems="center">
                                        {comm.isHighPriority && <PriorityHighIcon color="error" fontSize="small" />}
                                        <IconButton size="small" onClick={() => handleOpenModal(comm)}><EditIcon /></IconButton>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
             {filteredCommunications.length === 0 && !loading && ( <Typography sx={{ textAlign: 'center', mt: 4, p: 3 }}>Δεν βρέθηκαν επικοινωνίες.</Typography> )}
        </Paper>
    );
}