import React, { useState, useEffect } from 'react';
import { Typography, Paper, List, ListItem, ListItemText, Divider, CircularProgress, Stack } from '@mui/material'; // ✅ Η ΔΙΟΡΘΩΣΗ ΕΙΝΑΙ ΕΔΩ
import HistoryIcon from '@mui/icons-material/History';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firestore';
import { useModal } from '../../context/ModalContext';

export default function RecentActivityWidget() {
    const { showModal } = useModal();
    const [recent, setRecent] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'wineries'),
            orderBy('lastOpenedAt', 'desc'),
            limit(5)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const recentWineries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRecent(recentWineries);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleItemClick = (winery) => {
        showModal('WINERY_PROFILE', { winery });
    };

    return (
        <Paper sx={{ p: 2, height: '100%', borderRadius: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <HistoryIcon color="primary" />
                <Typography variant="h6">Πρόσφατη Δραστηριότητα</Typography>
            </Stack>
            <Divider />
            {loading ? <CircularProgress sx={{mt: 2}} /> : (
                <List dense>
                    {recent.length > 0 ? recent.map(winery => (
                        <ListItem button key={winery.id} onClick={() => handleItemClick(winery)}>
                            <ListItemText
                                primary={winery.name}
                                secondary={winery.lastOpenedAt ? `Ανοίχτηκε: ${winery.lastOpenedAt.toDate().toLocaleString('el-GR')}` : 'Δεν έχει ανοιχτεί'}
                            />
                        </ListItem>
                    )) : (
                         <Typography variant="body2" color="text.secondary" sx={{p: 2}}>Δεν υπάρχει πρόσφατη δραστηριότητα.</Typography>
                    )}
                </List>
            )}
        </Paper>
    );
}