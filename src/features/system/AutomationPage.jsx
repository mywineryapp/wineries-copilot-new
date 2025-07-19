import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Stack, CircularProgress, Alert, Divider, Chip } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firestore';
import { useNotifier } from '../../context/NotificationContext';
import { useModal } from '../../context/ModalContext';

// Ένα μικρό component για κάθε λειτουργία
const FunctionCard = ({ title, description, icon, functionName, onRun, isLoading, buttonText = "Εκτέλεση" }) => {
    return (
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} alignItems="center">
                <Box sx={{color: 'primary.main'}}>{icon}</Box>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{title}</Typography>
                    <Typography variant="body2" color="text.secondary">{description}</Typography>
                </Box>
                <Button
                    variant="contained"
                    onClick={() => onRun(functionName)}
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    sx={{flexShrink: 0, width: {xs: '100%', sm: 'auto'}}}
                >
                    {isLoading ? "Εκτελείται..." : buttonText}
                </Button>
            </Stack>
        </Paper>
    );
};

export default function AutomationPage() {
    const { showNotification } = useNotifier();
    const { showModal } = useModal();
    const [loadingFunction, setLoadingFunction] = useState(null);

    const handleRunFunction = async (functionName) => {
        if (!window.confirm("Αυτή η ενέργεια θα επεξεργαστεί δεδομένα στη βάση. Είστε σίγουροι;")) {
            return;
        }
        setLoadingFunction(functionName);
        showNotification(`Η εκτέλεση της ενέργειας "${functionName}" ξεκίνησε...`, "info");

        try {
            const cloudFunction = httpsCallable(functions, functionName);
            const result = await cloudFunction();
            showNotification(result.data.message, 'success');
        } catch (error) {
            console.error(`Execution of ${functionName} failed:`, error);
            showNotification(`Η εκτέλεση απέτυχε: ${error.message}`, 'error');
        } finally {
            setLoadingFunction(null);
        }
    };
    
    // Ειδική συνάρτηση για τα modals που δεν θέλουν επιβεβαίωση
    const handleOpenModal = (modalName) => {
        showModal(modalName);
    };

    return (
        <Paper sx={{ p: 3, maxWidth: 'lg', mx: 'auto' }}>
            <Typography variant="h4" gutterBottom sx={{color: 'primary.main', fontWeight: 'bold'}}>
                Αυτοματισμοί & Εισαγωγή Δεδομένων
            </Typography>
            <Typography paragraph color="text.secondary">
                Από εδώ μπορείτε να εκτελέσετε τις μαζικές & έξυπνες λειτουργίες της εφαρμογής.
            </Typography>
            <Divider sx={{ my: 3 }} />

            <Stack spacing={3}>
                <Divider sx={{my:1}}><Chip label="Εισαγωγή Αρχείων" size="small" /></Divider>
                <FunctionCard
                    title="Εισαγωγή Πωλήσεων"
                    description="Ανεβάστε το αρχείο Excel με τις πωλήσεις για να εισαχθούν μαζικά στη βάση δεδομένων (collection: invoices)."
                    icon={<UploadFileIcon fontSize="large" />}
                    functionName="SALES_UPLOAD"
                    onRun={handleOpenModal}
                    buttonText="Άνοιγμα"
                />
                 <FunctionCard
                    title="Ενημέρωση Υπολοίπων"
                    description="Ανεβάστε το αρχείο Excel/PDF με τα ενηλικιωμένα υπόλοιπα για να ενημερωθεί η κεντρική λίστα υπολοίπων."
                    icon={<UploadFileIcon fontSize="large" />}
                    functionName="BALANCE_UPLOAD"
                    onRun={handleOpenModal}
                    buttonText="Άνοιγμα"
                />

                <Divider sx={{my:2}}><Chip label="Έξυπνες Λειτουργίες" size="small" /></Divider>

                <FunctionCard
                    title="Έξυπνος Καθαρισμός Σημειώσεων"
                    description="Σαρώνει όλα τα τιμολόγια και συμπληρώνει αυτόματα τα πεδία 'Φιάλη' και 'Οίνος' από το πεδίο 'Σημειώσεις'."
                    icon={<CleaningServicesIcon fontSize="large" />}
                    functionName="cleanupInvoiceNotes"
                    onRun={handleRunFunction}
                    isLoading={loadingFunction === 'cleanupInvoiceNotes'}
                />
                <FunctionCard
                    title="Συγχρονισμός Τύπων Φιαλών"
                    description="Βρίσκει όλους τους μοναδικούς τύπους φιαλών από τα τιμολόγια και τους προσθέτει αυτόματα στις Ρυθμίσεις."
                    icon={<SyncIcon fontSize="large" />}
                    functionName="populateBottleTypesFromInvoices"
                    onRun={handleRunFunction}
                    isLoading={loadingFunction === 'populateBottleTypesFromInvoices'}
                />
                 <FunctionCard
                    title="Καθαρισμός Διπλότυπων (Φιάλες)"
                    description="Σαρώνει τη λίστα 'Τύποι Φιαλών' στις Ρυθμίσεις και διαγράφει αυτόματα όλες τις διπλότυπες εγγραφές."
                    icon={<SyncIcon fontSize="large" />}
                    functionName="deduplicateBottleTypes"
                    onRun={handleRunFunction}
                    isLoading={loadingFunction === 'deduplicateBottleTypes'}
                />
            </Stack>
        </Paper>
    );
}