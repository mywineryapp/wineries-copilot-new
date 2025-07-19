import React, { useState, useEffect } from 'react';
import { Typography, Paper, List, ListItem, ListItemText, Divider, CircularProgress, Stack } from '@mui/material'; // ✅ Η ΔΙΟΡΘΩΣΗ ΕΙΝΑΙ ΕΔΩ
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firestore';
import { useModal } from '../../context/ModalContext';

export default function LatestRemindersWidget() {
    const { showModal } = useModal();
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const today = new Date();
        const q = query(
            collection(db, 'communications'),
            where('isClosed', '==', false),
            where('reminderDate', '!=', null),
            orderBy('reminderDate', 'asc'),
            limit(5)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const freshReminders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReminders(freshReminders);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleItemClick = (communication) => {
        showModal('COMMUNICATION_EDIT', { communication });
    };

    return (
        <Paper sx={{ p: 2, height: '100%', borderRadius: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <NotificationsActiveIcon color="primary" />
                <Typography variant="h6">Επόμενες Υπενθυμίσεις</Typography>
            </Stack>
            <Divider />
            {loading ? <CircularProgress sx={{mt: 2}} /> : (
                <List dense>
                    {reminders.length > 0 ? reminders.map(rem => (
                        <ListItem button key={rem.id} onClick={() => handleItemClick(rem)}>
                            <ListItemText
                                primary={rem.wineryName}
                                secondary={`Σκοπός: ${rem.purposeName || '-'}`}
                            />
                            <Typography variant="body2" color="text.secondary">
                                {rem.reminderDate.toDate().toLocaleDateString('el-GR')}
                            </Typography>
                        </ListItem>
                    )) : (
                        <Typography variant="body2" color="text.secondary" sx={{p: 2}}>Δεν υπάρχουν επερχόμενες υπενθυμίσεις.</Typography>
                    )}
                </List>
            )}
        </Paper>
    );
}