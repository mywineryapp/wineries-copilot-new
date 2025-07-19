// src/components/NotificationManager.js

import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useNotifier } from '../context/NotificationContext';

const NotificationManager = () => {
    const { notification, hideNotification } = useNotifier();

    if (!notification) {
        return null;
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        hideNotification();
    };

    return (
        <Snackbar
            open={!!notification}
            autoHideDuration={6000}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            key={notification.key}
        >
            <Alert
                onClose={handleClose}
                severity={notification.severity}
                variant="filled"
                sx={{ width: '100%' }}
            >
                {notification.message}
            </Alert>
        </Snackbar>
    );
};

export default NotificationManager;