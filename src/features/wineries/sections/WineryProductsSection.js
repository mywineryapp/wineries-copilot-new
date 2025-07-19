import React, { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Paper,
    Stack,
    CircularProgress,
    Alert,
    Grid,
    Card, CardContent, CardMedia,
    Chip,
    Button
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import { collection, query, where, onSnapshot, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../../../services/firestore';

import { AddButton } from '../../../components/buttons';

import ProductsEditModal from '../modals/ProductsEditModal';


export default function WineryProductsSection({ winery, setEditMode }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isProductEditModalOpen, setIsProductEditModalOpen] = useState(false);
    const [currentWine, setCurrentWine] = useState(null);

    // Χαρτογράφηση χρωμάτων για το background των CHIPS
    const displayColorMap = {
        'Λευκό': '#F0F4F8', // Πιο απαλό γκρι-μπλε
        'Κόκκινο': '#FEECEE', // Πιο απαλό κόκκινο
        'Ροζ': '#FFF0F5',   // Πιο απαλό ροζ
        'Κίτρινο': '#FFFBEA', // Πιο απαλό κίτρινο
        'Orange': '#FFF4E5',  // Πιο απαλό πορτοκαλί
        'Άλλα': '#EFF2F5'    // Απαλό γκρι
    };

    // Χαρτογράφηση χρωμάτων για το περίγραμμα/κείμενο των επικεφαλίδων ομάδων
    const baseBorderOrTextColorMap = {
        'Λευκό': '#7C93AE', // Πιο σκούρο μπλε για Λευκά Κρασιά
        'Κόκκινο': '#D32F2F',
        'Ροζ': '#EC407A',
        'Κίτρινο': '#FFD600',
        'Orange': '#FB8C00',
        'Άλλα': '#B0BEC5'
    };

    // Χαρτογράφηση των πιθανών τιμών του color πεδίου σε μια τυποποιημένη μορφή
    const standardizedColorMap = {
        'Λευκό': 'Λευκό', 'λευκό': 'Λευκό', 'White': 'Λευκό', 'white': 'Λευκό',
        'Κόκκινο': 'Κόκκινο', 'κόκκινο': 'Κόκκινο', 'Red': 'Κόκκινο', 'red': 'Κόκκινο', 'Ερυθρό': 'Κόκκινο', 'ερυθρό': 'Κόκκινο',
        'Ροζ': 'Ροζ', 'ροζ': 'Ροζ', 'Ροζέ': 'Ροζ', 'ροζέ': 'Ροζ', 'Pink': 'Ροζ', 'pink': 'Ροζ',
        'Κίτρινο': 'Κίτρινο', 'κίτρινο': 'Κίτρινο', 'Yellow': 'Κίτρινο', 'yellow': 'Κίτρινο',
        'Orange': 'Orange', 'orange': 'Orange',
    };
    
    // Χαρτογράφηση για την πλήρη ελληνική ονομασία των επικεφαλίδων ομάδων
    const greekColorGroupNames = {
        'Λευκό': 'Λευκά Κρασιά',
        'Κόκκινο': 'Κόκκινα Κρασιά',
        'Ροζ': 'Ροζέ Κρασιά',
        'Κίτρινο': 'Κίτρινα Κρασιά',
        'Orange': 'Orange Κρασιά',
        'Άλλα': 'Άλλα / Αταξινόμητα Κρασιά'
    };

    useEffect(() => {
        if (!winery?.id) {
            setLoading(false);
            setError("Δεν βρέθηκε ID οινοποιείου για τη φόρτωση προϊόντων.");
            return;
        }

        setLoading(true);
        setError(null);

        const winesRef = collection(db, 'wines');
        const q = query(winesRef, where('wineryId', '==', winery.id));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const fetchedProducts = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProducts(fetchedProducts);
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error("Σφάλμα φόρτωσης προϊόντων οινοποιείου:", err);
                setError("Αδυναμία φόρτωσης προϊόντων. Παρακαλώ δοκιμάστε ξανά.");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [winery?.id]);

    const handleAddProduct = () => {
        setCurrentWine(null);
        setIsProductEditModalOpen(true);
    };

    const handleEditProduct = (wine) => {
        setCurrentWine(wine);
        setIsProductEditModalOpen(true);
    };

    const handleDeleteProduct = async (wineId) => {
        if (window.confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το προϊόν; Αυτή η ενέργεια δεν αναστρέφεται.")) {
            try {
                const wineToDeleteRef = doc(db, 'wines', wineId);
                const wineToDeleteSnap = await getDoc(wineToDeleteRef);
                const wineToDeleteData = wineToDeleteSnap.data();

                if (wineToDeleteData?.labelImageURL) {
                    const imageRef = ref(storage, wineToDeleteData.labelImageURL);
                    try {
                        await deleteObject(imageRef);
                        console.log("Ετικέτα διαγράφηκε επιτυχώς από το Storage.");
                    } catch (storageErr) {
                        console.warn("Αδυναμία διαγραφής ετικέτας από το Storage:", storageErr);
                    }
                }

                await deleteDoc(wineToDeleteRef);
                console.log("Το προϊόν διαγράφηκε επιτυχώς:", wineId);
                setIsProductEditModalOpen(false);
                setCurrentWine(null);
            } catch (err) {
                console.error("Σφάλμα κατά τη διαγραφή προϊόντος:", err);
                alert("Σφάλμα κατά τη διαγραφή προϊόντος: " + err.message);
            }
        }
    };

    const handleCloseProductEditModal = () => {
        setIsProductEditModalOpen(false);
        setCurrentWine(null);
    };

    const handleSaveProductSuccess = () => {
        // Η λίστα ενημερώνεται αυτόματα από το onSnapshot
    };

    const ProductCard = ({ product }) => {
        const standardizedColor = product.color ? standardizedColorMap[product.color] : 'Άλλα';
        const cardBgColor = '#FFFFFF';

        return (
            <Card
                sx={{
                    display: 'flex',
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    boxShadow: 1,
                    minHeight: 120,
                    backgroundColor: cardBgColor,
                    cursor: 'pointer',
                    transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out',
                    '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-3px)',
                    },
                    flexDirection: { xs: 'column', sm: 'row' }, // Μπορεί να χρειαστεί προσαρμογή εδώ αν θέλεις μόνο κάθετη στοίχιση
                    alignItems: { xs: 'center', sm: 'center' }, // Κεντράρισμα εικόνας για μικρές οθόνες
                    p: { xs: 1, sm: 0 },
                }}
                onClick={() => handleEditProduct(product)}
            >
                {product.labelImageURL && (
                    <CardMedia
                        component="img"
                        sx={{
                            width: { xs: 80, sm: 100 },
                            height: { xs: 80, sm: 100 },
                            objectFit: 'contain',
                            p: { xs: 0.5, sm: 1 },
                            flexShrink: 0,
                            borderRadius: { xs: 1, sm: 2 }
                        }}
                        image={product.labelImageURL}
                        alt={`Ετικέτα ${product.name}`}
                    />
                )}
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    p: { xs: 1, sm: 2 },
                    pt: { xs: 1.5, sm: 1.5 },
                    textAlign: 'center', // ΕΔΩ ΕΦΑΡΜΟΖΕΤΑΙ Η ΣΤΟΙΧΙΣΗ ΣΤΟ ΚΕΝΤΡΟ
                    alignItems: 'center', // Κεντράρισμα των στοιχείων μέσα στο flex container
                    justifyContent: 'center' // Κεντράρισμα κάθετα αν υπάρχει χώρος
                }}>
                    <Typography
                        variant="subtitle1"
                        component="div"
                        sx={{
                            fontWeight: 'medium',
                            color: 'text.primary',
                            mb: 0.5
                        }}
                    >
                        {product.name || 'Χωρίς Όνομα'}
                    </Typography>
                    {product.color && (
                        <Chip
                            label={product.color}
                            size="small"
                            sx={{
                                mb: 0.5,
                                backgroundColor: displayColorMap[standardizedColor] || '#e0e0e0',
                                color: (standardizedColor === 'Λευκό' || standardizedColor === 'Κίτρινο' || standardizedColor === 'Orange' || standardizedColor === 'Ροζ') ? 'rgba(0, 0, 0, 0.87)' : '#333',
                                fontSize: '0.75rem',
                                px: 1,
                                py: 0.2
                            }}
                        />
                    )}
                    {product.variety && product.variety.length > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {Array.isArray(product.variety) ? product.variety.join(', ') : product.variety}
                        </Typography>
                    )}
                    {product.capType && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {product.capType}
                        </Typography>
                    )}
                </Box>
            </Card>
        );
    };

    const groupedProducts = products.reduce((acc, product) => {
        const standardizedColor = product.color ? standardizedColorMap[product.color] : 'Άλλα';
        const groupKey = standardizedColor || 'Άλλα';

        if (!acc[groupKey]) {
            acc[groupKey] = [];
        }
        acc[groupKey].push(product);
        return acc;
    }, {});

    const orderedColors = ['Λευκό', 'Κόκκινο', 'Ροζ', 'Κίτρινο', 'Orange', 'Άλλα'];
    const sortedGroupedProducts = orderedColors.reduce((acc, color) => {
        if (groupedProducts[color]) {
            acc[color] = groupedProducts[color];
        }
        return acc;
    }, {});


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
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="flex-end"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={2}
                sx={{ mb: 3 }}
            >
                <AddButton onClick={handleAddProduct} startIcon={<AddIcon />}>
                    Προσθήκη Νέου Προϊόντος
                </AddButton>
            </Stack>

            <Box sx={{ mt: 3 }}>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                )}

                {!loading && !error && products.length === 0 ? (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '300px',
                        flexDirection: 'column'
                    }}>
                        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
                            Δεν έχουν καταχωρηθεί προϊόντα για αυτό το οινοποιείο.
                        </Typography>
                        <Typography variant="body2" color="text.disabled" align="center">
                            Κάντε κλικ στο κουμπί "Προσθήκη Νέου Προϊόντος" για να ξεκινήσετε.
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={4}>
                        {Object.keys(sortedGroupedProducts).map((color) => {
                            let headerTextColor = baseBorderOrTextColorMap[color] || baseBorderOrTextColorMap['Άλλα'];
                            
                            if (color === 'Κίτρινο') {
                                headerTextColor = '#D4AA00';
                            } else if (color === 'Orange') {
                                headerTextColor = '#D66E00';
                            }

                            return (
                                <Box
                                    key={color}
                                    sx={{
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        pb: 2,
                                        backgroundColor: '#fdfdfd'
                                    }}
                                >
                                    <Box
                                        sx={{
                                            p: 2,
                                            mb: 2,
                                            backgroundColor: '#f5f5f5',
                                            borderBottom: '1px solid #eee',
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 'bold',
                                                color: headerTextColor
                                            }}
                                        >
                                            {greekColorGroupNames[color] || 'Άλλα / Αταξινόμητα Κρασιά'}
                                        </Typography>
                                    </Box>
                                    <Grid container spacing={2} sx={{ px: 2 }}>
                                        {sortedGroupedProducts[color].map((product) => (
                                            <Grid item xs={12} sm={6} md={4} key={product.id}>
                                                <ProductCard product={product} />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            );
                        })}
                    </Stack>
                )}
            </Box>

            {isProductEditModalOpen && (
                <ProductsEditModal
                    open={isProductEditModalOpen}
                    onClose={handleCloseProductEditModal}
                    wineryId={winery.id}
                    wine={currentWine}
                    onSaveSuccess={handleSaveProductSuccess}
                    onDeleteProduct={handleDeleteProduct}
                />
            )}
        </Paper>
    );
}