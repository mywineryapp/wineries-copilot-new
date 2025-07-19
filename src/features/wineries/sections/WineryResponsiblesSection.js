import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Grid,
    Stack,
    Card,
    CardContent,
    Button,
    Typography,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Person as PersonIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Smartphone as SmartphoneIcon,
    LocalPhone
} from '@mui/icons-material';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function WineryResponsiblesSection({ winery, db, onContactClick }) {
    const [groupedContacts, setGroupedContacts] = useState({});
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const normalizeRoleName = (role) => role?.trim() || '';

    useEffect(() => {
        setLoading(true);
        setFetchError(null);
        setGroupedContacts({});

        if (!db || !winery?.id) {
            setFetchError("Δεν υπάρχει σύνδεση ή ID οινοποιείου.");
            setLoading(false);
            return;
        }

        const q = query(collection(db, 'contacts'), where('wineryId', '==', winery.id));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const grouped = fetched.reduce((acc, contact) => {
                const originalRole = contact.role || 'Άλλοι Υπεύθυνοι';
                const normalized = normalizeRoleName(originalRole);
                if (!acc[normalized]) {
                    acc[normalized] = {
                        roleDisplayName: originalRole,
                        contacts: [],
                    };
                }
                acc[normalized].contacts.push(contact);
                return acc;
            }, {});

            setGroupedContacts(grouped);
            setLoading(false);
        }, (error) => {
            setFetchError(`Σφάλμα φόρτωσης επαφών: ${error.message}`);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [db, winery?.id]);

    const getPhoneIcon = (type) => {
        switch (type) {
            case 'κινητό': return <SmartphoneIcon sx={{ mr: 1, fontSize: 'small', color: '#777' }} />;
            case 'σταθερό': return <LocalPhone sx={{ mr: 1, fontSize: 'small', color: '#777' }} />;
            default: return <PhoneIcon sx={{ mr: 1, fontSize: 'small', color: '#777' }} />;
        }
    };

    const defaultCardBorderColor = '#e0e0e0';
    const roleTitleBgColor = '#f5f5f5';

    const preferredRoleOrder = [
        'Οινόλογος',
        'Λογιστήριο',
        'Γραμματεία',
        'Υπεύθυνος Παραγωγής',
        'Διευθυντής Πωλήσεων',
        'Γενικός Διευθυντής',
        'Οικονομικός Διευθυντής',
        'ΟινόλογοςΒ',
        'Άλλοι Υπεύθυνοι',
        'Υπεύθυνος Επικοινωνίας'
    ];

    return (
        <Paper
            elevation={0}
            sx={{
                mt: 2,
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                minHeight: '440px',
                overflow: 'hidden',
            }}
        >
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
            >
                <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                    
                </Typography>
                <Button
                    variant="text"
                    size="small"
                    onClick={() => onContactClick(null)}
                    sx={{
                        minWidth: 'auto',
                        padding: '6px 8px',
                        color: 'primary.main',
                        '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        }
                    }}
                >
                    ➕
                </Button>
            </Stack>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                    <CircularProgress />
                </Box>
            )}

            {fetchError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {fetchError}
                </Alert>
            )}

            {!loading && !fetchError && Object.keys(groupedContacts).length > 0 ? (
                <Grid container spacing={3}>
                    {Object.keys(groupedContacts)
                        .sort((a, b) => {
                            const indexA = preferredRoleOrder.indexOf(a);
                            const indexB = preferredRoleOrder.indexOf(b);
                            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                            if (indexA !== -1) return -1;
                            if (indexB !== -1) return 1;
                            return a.localeCompare(b, 'el');
                        })
                        .map((normalizedRole) => {
                            const group = groupedContacts[normalizedRole];
                            const contacts = group.contacts;
                            const displayRole = group.roleDisplayName;

                            // Ελέγχουμε αν ο ρόλος είναι "Άλλοι Υπεύθυνοι" ή "Υπεύθυνος Επικοινωνίας" και δεν έχει επαφές,
                            // τότε δεν εμφανίζουμε την κάρτα του.
                            if (
                                contacts.length === 0 &&
                                (displayRole === 'Άλλοι Υπεύθυνοι' || displayRole === 'Υπεύθυνος Επικοινωνίας')
                            ) return null;

                            return (
                                <Grid item xs={12} sm={6} md={4} key={normalizedRole}>
                                    <Card
                                        elevation={0}
                                        sx={{
                                            border: `1px solid ${defaultCardBorderColor}`,
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }}
                                    >
                                        <Box sx={{
                                            backgroundColor: roleTitleBgColor,
                                            p: 1.5,
                                            borderBottom: `1px solid ${defaultCardBorderColor}`,
                                        }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                                {displayRole}
                                            </Typography>
                                        </Box>
                                        <CardContent sx={{ p: 2, flexGrow: 1 }}>
                                            {contacts.map((contact) => (
                                                <Box
                                                    key={contact.id}
                                                    // Αυτό το onClick ενεργοποιεί το modal επεξεργασίας
                                                    onClick={() => onContactClick(contact)}
                                                    sx={{
                                                        mb: 2,
                                                        p: 1.5,
                                                        borderRadius: 1,
                                                        border: '1px solid #f0f0f0',
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            backgroundColor: '#fafafa',
                                                            boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
                                                        },
                                                        '&:last-child': { mb: 0 },
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                                        <PersonIcon sx={{ mr: 1, fontSize: 'small', color: '#555' }} />
                                                        <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                                                            {contact.name || 'Χωρίς όνομα'}
                                                        </Typography>
                                                    </Box>
                                                    {contact.phones?.map((phone, i) => (
                                                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                                            {getPhoneIcon(phone.type)}
                                                            <Typography variant="body2" color="text.secondary">
                                                                <a
                                                                    href={`tel:${phone.value}`}
                                                                    style={{ textDecoration: 'none', color: '#1976d2' }}
                                                                    // ΣΤΑΜΑΤΑΕΙ ΤΟ CLICK EVENT ΑΠΟ ΤΟ ΝΑ ΦΤΑΣΕΙ ΣΤΟΝ ΓΟΝΙΚΟ BOX
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    {phone.value} {phone.type ? `(${phone.type})` : ''}
                                                                </a>
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                    {contact.emails?.map((email, i) => (
                                                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                                            <EmailIcon sx={{ mr: 1, fontSize: 'small', color: '#555' }} />
                                                            <Typography variant="body2" color="text.secondary">
                                                                <a
                                                                    href={`mailto:${email.value}`}
                                                                    style={{ textDecoration: 'none', color: '#1976d2' }}
                                                                    // ΣΤΑΜΑΤΑΕΙ ΤΟ CLICK EVENT ΑΠΟ ΤΟ ΝΑ ΦΤΑΣΕΙ ΣΤΟΝ ΓΟΝΙΚΟ BOX
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    {email.value}
                                                                </a>
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            ))}
                                            {contacts.length === 0 && (
                                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                    Δεν υπάρχουν επαφές για αυτό το ρόλο.
                                                </Typography>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                </Grid>
            ) : (!loading && !fetchError && Object.keys(groupedContacts).length === 0) && (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '300px',
                    flexDirection: 'column'
                }}>
                    <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
                        Δεν υπάρχουν καταχωρημένοι υπεύθυνοι για αυτό το οινοποιείο.
                    </Typography>
                    <Button variant="outlined" onClick={() => onContactClick(null)}>
                        Προσθήκη Πρώτου Υπεύθυνου
                    </Button>
                </Box>
            )}
        </Paper>
    );
}