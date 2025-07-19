import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Stack,
  CircularProgress, List, ListItem, Alert, Chip, Divider
} from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../services/firestore';
import { useNotifier } from '../../context/NotificationContext';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// --- Component για κάθε ομάδα αποτελεσμάτων ---
const CorrectionGroup = ({ groupName, items, onNormalize, onRefresh }) => {
    const [newName, setNewName] = useState(groupName);
    const [loading, setLoading] = useState(false);

    const handleNormalize = async () => {
        if (!newName.trim()) return;
        setLoading(true);
        const oldNames = items.map(item => item.bottleInfo);
        // Καλούμε τη συνάρτηση που μας έδωσε ο γονέας
        await onNormalize(oldNames, newName.trim());
        setLoading(false);
        // Ζητάμε από τον γονέα να ξανακάνει την αναζήτηση
        onRefresh(); 
    };

    return (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">Βρέθηκαν {items.length} εγγραφές που μοιάζουν με "{groupName}"</Typography>
            <List dense sx={{ maxHeight: 150, overflow: 'auto', my: 1 }}>
                {items.slice(0, 5).map(item => (
                    <ListItem key={item.id}>
                        <Typography variant="caption">- {item.bottleInfo}</Typography>
                    </ListItem>
                ))}
                {items.length > 5 && <ListItem><Typography variant="caption">...και {items.length - 5} ακόμη.</Typography></ListItem>}
            </List>
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
        </Paper>
    );
};


// --- Το Κυρίως Component της Σελίδας ---
export default function DataCleaningPage() {
    const { showNotification } = useNotifier();
    const [searchTerm, setSearchTerm] = useState('');
    const [allInvoices, setAllInvoices] = useState([]);
    const [groupedResults, setGroupedResults] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            showNotification('Παρακαλώ εισάγετε όρο αναζήτησης.', 'warning');
            return;
        }
        
        const term = searchTerm.trim().toLowerCase();
        
        const matchingInvoices = allInvoices.filter(invoice => 
            invoice.bottleInfo && invoice.bottleInfo.toLowerCase().includes(term)
        );

        if (matchingInvoices.length === 0) {
            showNotification('Δεν βρέθηκαν εγγραφές που να περιέχουν αυτόν τον όρο.', 'info');
            setGroupedResults([]);
            return;
        }

        // Ομαδοποιούμε τα αποτελέσματα με βάση το ακριβές όνομα
        const groups = matchingInvoices.reduce((acc, item) => {
            const key = item.bottleInfo;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(item);
            return acc;
        }, {});
        
        const finalGroups = Object.keys(groups).map(key => ({
            groupName: key,
            items: groups[key]
        }));
        
        setGroupedResults(finalGroups);
    };
    
    const handleNormalizeGroup = async (oldNames, newName) => {
        try {
            const normalizeFunction = httpsCallable(functions, 'normalizeBottleInfo');
            const result = await normalizeFunction({ oldNames, newName });
            showNotification(result.data.message, 'success');
        } catch (error) {
            showNotification(`Σφάλμα: ${error.message}`, 'error');
        }
    };

    if (loading) {
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
                Αναζητήστε παραλλαγές στο πεδίο "Φιάλη" και ομαδοποιήστε τες σε μία, καθαρή εγγραφή.
            </Typography>
            
            <Stack direction="row" spacing={1} sx={{ my: 2 }}>
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
                 <Stack spacing={2}>
                    {groupedResults.map(group => (
                        <CorrectionGroup 
                            key={group.groupName}
                            groupName={group.groupName}
                            items={group.items}
                            onNormalize={handleNormalizeGroup}
                            onRefresh={handleSearch}
                        />
                    ))}
                </Stack>
            ) : (
                <Alert severity="info">Τα αποτελέσματα της αναζήτησης θα εμφανιστούν εδώ.</Alert>
            )}
        </Paper>
    );
}