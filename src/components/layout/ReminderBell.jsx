import React, { useState, useEffect } from 'react';
import { IconButton, Badge, Tooltip, Menu, MenuItem, ListItemText, Typography, Divider } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../services/firestore';
import { useModal } from '../../context/ModalContext';

export default function ReminderBell() {
    const { showModal } = useModal();
    const [reminders, setReminders] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Θέτουμε την ώρα στην αρχή της ημέρας

        const q = query(
            collection(db, 'communications'),
            where('isClosed', '==', false),
            where('reminderDate', '<=', today), // Υπενθυμίσεις μέχρι και σήμερα
            orderBy('reminderDate', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const overdueReminders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReminders(overdueReminders);
        });

        return () => unsubscribe();
    }, []);

    const handleOpenMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };
    
    const handleItemClick = (communication) => {
        showModal('COMMUNICATION_EDIT', { communication });
        handleCloseMenu();
    };

    return (
        <>
            <Tooltip title="Υπενθυμίσεις">
                <IconButton color="inherit" onClick={handleOpenMenu}>
                    <Badge badgeContent={reminders.length} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
            >
                <Typography sx={{ p: 2, fontWeight: 'bold' }}>Εκκρεμείς Υπενθυμίσεις</Typography>
                <Divider />
                {reminders.length === 0 ? (
                    <MenuItem disabled>Δεν υπάρχουν εκκρεμείς υπενθυμίσεις.</MenuItem>
                ) : (
                    reminders.map(rem => (
                        <MenuItem key={rem.id} onClick={() => handleItemClick(rem)}>
                            <ListItemText 
                                primary={rem.wineryName} 
                                secondary={`Υπενθύμιση για: ${rem.purposeName}`} 
                            />
                        </MenuItem>
                    ))
                )}
            </Menu>
        </>
    );
}