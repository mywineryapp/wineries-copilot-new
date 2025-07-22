import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Stack,
  CircularProgress, Alert, Accordion, AccordionSummary, AccordionDetails, Chip, Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../services/firestore';
import { useNotifier } from '../../context/NotificationContext';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Custom Hook για τη φόρτωση των δεδομένων
const useInvoiceData = () => {
    const [allInvoices, setAllInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotifier();

    useEffect(() => {
        const fetchAllInvoices = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'invoices'));
                const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAllInvoices(allDocs);
            } catch (error) {
                showNotification(`Σφάλμα φόρτωσης δεδομένων: ${error.message}`, 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchAllInvoices();
    }, [showNotification]);

    return { allInvoices, loading };
};

// Component για κάθε ομάδα αποτελεσμάτων, τώρα με Accordion
const CorrectionGroup = ({ groupName, items, onNormalize, onRefresh }) => {
    const [newName, setNewName] = useState(groupName);
    const [loading, setLoading] = useState(false);

    const handleNormalize = async () => {
        if (!newName.trim()) return;
        setLoading(true);
        const itemIds = items.map(item => item.id);
        await onNormalize(itemIds, newName.trim());
        setLoading(false);
        onRefresh(); 
    };

    return (
        <Paper elevation={1} sx={{mb: 1}}>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Chip label={items.length} color="primary" size="small" />
                        <Typography>{groupName}</Typography>
                    </Stack>
                </AccordionSummary>
                <AccordionDetails>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <TextField 
                            label="Διόρθωση Όλων σε:" 
                            value={newName} 
                            onChange={(e) => setNewName(e.target.value)}
                            size="small"
                            fullWidth
                        />
                        <Button 
                            variant="contained" 
                            onClick={handleNormalize}
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                        >
                            Ομαδοποίηση
                        </Button>
                    </Stack>
                </AccordionDetails>
            </Accordion>
        </Paper>
    );
};

// --- Το Κυρίως Component της Σελίδας ---
export default function DataCleaningPage() {
    const { showNotification } = useNotifier();
    const { allInvoices, loading: dataLoading } = useInvoiceData();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSearch, setActiveSearch] = useState('');

    const groupedResults = useMemo(() => {
        if (!activeSearch) return [];
        
        const term = activeSearch.toLowerCase();
        
        const matchingInvoices = allInvoices.filter(invoice => 
            invoice.bottleInfo && invoice.bottleInfo.toLowerCase().includes(term)
        );

        if (matchingInvoices.length === 0) return [];

        const groups = matchingInvoices.reduce((acc, item) => {
            const key = item.bottleInfo;
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});
        
        return Object.keys(groups).map(key => ({
            groupName: key,
            items: groups[key]
        })).sort((a, b) => b.items.length - a.items.length);
        
    }, [allInvoices, activeSearch]);

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            showNotification('Παρακαλώ εισάγετε όρο αναζήτησης.', 'warning');
            return;
        }
        setActiveSearch(searchTerm.trim());
    };
    
    const handleNormalizeGroup = async (itemIds, newName) => {
        try {
            const batch = writeBatch(db);
            itemIds.forEach(id => {
                const docRef = doc(db, 'invoices', id);
                batch.update(docRef, { bottleInfo: newName });
            });
            await batch.commit();
            showNotification(`Επιτυχής ομαδοποίηση ${itemIds.length} εγγραφών!`, 'success');
        } catch (error) {
            showNotification(`Σφάλμα: ${error.message}`, 'error');
        }
    };
    
    if (dataLoading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', p: 5}}>
                <CircularProgress />
                <Typography sx={{ml: 2}}>Φόρτωση δεδομένων τιμολογίων...</Typography>
            </Box>
        );
    }

    return (
        <Paper sx={{ p: 3, maxWidth: 'lg', mx: 'auto' }}>
            <Typography variant="h4" gutterBottom sx={{color: 'primary.main', fontWeight: 'bold'}}>
                Έξυπνος Καθαρισμός Δεδομένων
            </Typography>
            <Typography paragraph color="text.secondary">
                Αναζήτησε παραλλαγές στο πεδίο "Φιάλη" και ομαδοποίησέ τες σε μία, καθαρή εγγραφή.
            </Typography>
            
            <Stack direction={{xs: 'column', sm: 'row'}} spacing={1} sx={{ my: 2 }}>
                <TextField
                    label="Αναζήτηση Φιάλης (π.χ. 'agape')"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    fullWidth
                    size="small"
                />
                <Button variant="contained" onClick={handleSearch} startIcon={<SearchIcon />}>
                    Αναζήτηση
                </Button>
            </Stack>

            <Divider sx={{my: 3}} />

            {groupedResults.length > 0 ? (
                 <Stack spacing={1}>
                    {groupedResults.map(group => (
                        <CorrectionGroup 
                            key={group.groupName}
                            groupName={group.groupName}
                            items={group.items}
                            onNormalize={handleNormalizeGroup}
                            onRefresh={() => setActiveSearch(prev => `${prev}`)}
                        />
                    ))}
                </Stack>
            ) : (
                <Alert severity="info">
                    {activeSearch 
                        ? `Δεν βρέθηκαν εγγραφές που να περιέχουν τον όρο "${activeSearch}".`
                        : "Τα αποτελέσματα της αναζήτησης θα εμφανιστούν εδώ."
                    }
                </Alert>
            )}
        </Paper>
    );
}