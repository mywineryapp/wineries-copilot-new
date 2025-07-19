// src/features/wineries/modals/WineryModalWrapper.js

import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../services/firestore';
import { Modal, Box, CircularProgress, Typography } from '@mui/material';

// Import όλα τα διαφορετικά Modals που μπορεί να δείξει αυτός ο Wrapper
import WineryContactsModal from './WineryContactsModal';
import WineryInfoEditModal from './WineryInfoEditModal';
import ContactsEditModal from './ContactsEditModal';
import ProductionEditModal from './ProductionEditModal';
import WineryCommunicationEditModal from './WineryCommunicationEditModal';
// ... import άλλα modals αν χρειαστούν στο μέλλον

// ✅ Τώρα παίρνει τα props απευθείας από τον GlobalModalManager
export default function WineryModalWrapper({ winery: initialWinery, open, onClose }) {
    const [wineryData, setWineryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // ✅ Το editMode θα το διαχειριζόμαστε πλέον εσωτερικά εδώ
    const [editMode, setEditMode] = useState('profile');

    useEffect(() => {
        if (!initialWinery?.id || !open) {
            setWineryData(null);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);
        // Επαναφορά στο βασικό προφίλ κάθε φορά που ανοίγει για νέο οινοποιείο
        setEditMode('profile');

        const wineryRef = doc(db, 'wineries', initialWinery.id);
        const unsubscribe = onSnapshot(
            wineryRef,
            (docSnap) => {
                if (docSnap.exists()) {
                    setWineryData({ id: docSnap.id, ...docSnap.data() });
                    setError(null);
                } else {
                    setWineryData(null);
                    setError('Το οινοποιείο δεν βρέθηκε.');
                }
                setLoading(false);
            },
            (err) => {
                console.error('WineryModalWrapper - Error fetching winery data:', err);
                setLoading(false);
                setError(`Σφάλμα φόρτωσης: ${err.message}`);
                setWineryData(null);
            }
        );
        return () => unsubscribe();
    }, [open, initialWinery?.id]);

    const handleCloseAll = () => {
        setEditMode('profile'); // Επαναφορά για την επόμενη φορά
        onClose(); // Κλείνει το modal μέσω του Context
    };

    // Συνάρτηση που θα κλείνει το modal επεξεργασίας και θα μας γυρνάει στο προφίλ
    const handleCloseEditModal = () => {
        setEditMode('profile');
    };

    // Συνάρτηση που θα καλείται μετά από επιτυχή αποθήκευση στο modal επεξεργασίας
    const handleEditSaveSuccess = () => {
        setEditMode('profile');
        // Εδώ αργότερα θα βάλουμε μια ειδοποίηση επιτυχίας!
    };

    if (!open) return null;

    if (loading) {
        return (
            <Modal open={open} onClose={onClose}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 2 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Φόρτωση δεδομένων οινοποιείου...</Typography>
                </Box>
            </Modal>
        );
    }

    if (error) {
        return (
            <Modal open={open} onClose={onClose}>
                 <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 2 }}>
                    <Typography color="error">{error}</Typography>
                </Box>
            </Modal>
        );
    }

    if (!wineryData) {
        // Αυτό το return καλύπτει την περίπτωση που τελείωσε το loading, δεν υπάρχει error, αλλά δεν βρέθηκαν δεδομένα.
        return null;
    }

    // Αποφασίζουμε ποιο παράθυρο θα δείξουμε με βάση το "editMode"
    switch (editMode) {
        case 'info':
            return <WineryInfoEditModal winery={wineryData} open={true} onClose={handleCloseEditModal} onSaveSuccess={handleEditSaveSuccess} />;
        case 'contacts':
             return <ContactsEditModal winery={wineryData} open={true} onClose={handleCloseEditModal} onSaveSuccess={handleEditSaveSuccess} db={db} />;
        case 'production':
             return <ProductionEditModal winery={wineryData} open={true} onClose={handleCloseEditModal} onSaveSuccess={handleEditSaveSuccess} db={db} />;
        case 'communications':
            return <WineryCommunicationEditModal winery={wineryData} open={true} onClose={handleCloseEditModal} onSaveSuccess={handleEditSaveSuccess} />
        // Το βασικό παράθυρο-καρτέλα
        case 'profile':
        default:
            return <WineryContactsModal winery={wineryData} open={true} onClose={handleCloseAll} setEditMode={setEditMode} db={db} />;
    }
}