// src/context/NotificationContext.js

import React, { createContext, useState, useContext, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotifier = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const showNotification = useCallback((message, severity = 'success') => {
        setNotification({ message, severity, key: new Date().getTime() });
    }, []);

    const hideNotification = () => {
        setNotification(null);
    };

    const value = {
        notification,
        showNotification,
        hideNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};