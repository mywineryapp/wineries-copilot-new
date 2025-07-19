// src/context/ModalContext.js

import React, { createContext, useState, useContext } from 'react';

// Δημιουργούμε το "Context", σαν ένα κεντρικό σημείο ανακοινώσεων
const ModalContext = createContext();

// Αυτή είναι η συνάρτηση που μας επιτρέπει να "ακούμε" τις ανακοινώσεις
export const useModal = () => useContext(ModalContext);

// Αυτό είναι το Component που "αγκαλιάζει" όλη την εφαρμογή
// και παρέχει τον "Ρεσεψιονίστ" σε όλα τα παιδιά του.
export const ModalProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        type: null, // π.χ. 'WINERY_PROFILE', 'EDIT_CONTACT'
        props: {}   // π.χ. { wineryId: '12345' }
    });

    // Συνάρτηση για να δείξουμε ένα παράθυρο
    const showModal = (type, props = {}) => {
        setModalState({ type, props });
    };

    // Συνάρτηση για να κρύψουμε το παράθυρο
    const hideModal = () => {
        setModalState({ type: null, props: {} });
    };

    const value = {
        modalType: modalState.type,
        modalProps: modalState.props,
        showModal,
        hideModal,
        isModalOpen: modalState.type !== null
    };

    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    );
};