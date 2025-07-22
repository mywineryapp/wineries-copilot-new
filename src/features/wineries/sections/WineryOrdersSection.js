import React, { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Button,
    CircularProgress,
    Stack,
    Paper,
    IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firestore';

// Εδώ δεν αλλάζουμε το interaction, μόνο τη θέση και το στυλ του κουμπιού προσθήκης
export default function WineryOrdersSection({ winery, setEditMode, onOpenOrderModal }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleRefresh = () => {
            if (winery?.id) {
                setLoading(true);
                fetchOrders();
            }
        };

        window.addEventListener('refresh-winery-orders', handleRefresh);

        // Fetch orders initially
        fetchOrders();

        return () => {
            window.removeEventListener('refresh-winery-orders', handleRefresh);
        };
    }, [winery]);

    const fetchOrders = async () => {
        if (!winery?.id) {
            setLoading(false);
            return;
        }

        try {
            const q = query(collection(db, 'orders'), where('wineryId', '==', winery.id));
            const snapshot = await getDocs(q);
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            docs.sort((a, b) => (b.orderDate?.toDate?.() || 0) - (a.orderDate?.toDate?.() || 0));
            setOrders(docs);
        } catch (err) {
            console.error('Σφάλμα κατά το fetch των παραγγελιών:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 2, position: 'relative' }}>
            {/* Κουμπί προσθήκης πάνω δεξιά */}
            <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
                <Button
                    variant="text"
                    size="small"
                    onClick={() => onOpenOrderModal(null)}
                    startIcon={<AddIcon />}
                    sx={{
                        minWidth: 'auto',
                        padding: '6px 8px',
                        color: 'primary.main',
                        fontWeight: 'bold',
                        '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        }
                    }}
                >
                    Νέα Παραγγελία
                </Button>
            </Box>

            <Stack direction="row" justifyContent="flex-start" alignItems="center" sx={{ mb: 2, pl: 1 }}>
                <Typography variant="h6">📦 Παραγγελίες Οινοποιείου</Typography>
            </Stack>

            {orders.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ pl: 1 }}>
                    Δεν βρέθηκαν παραγγελίες για αυτό το οινοποιείο.
                </Typography>
            ) : (
                <Stack spacing={2}>
                    {orders.map((order) => (
                        <Paper key={order.id} sx={{ p: 2 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="subtitle1">Παραγγελία #{order.id.substring(0, 8)}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Προϊόντα: {order.products?.length || 0} • Ημερομηνία Παραγγελίας: {order.orderDate?.toDate?.().toLocaleDateString?.() || '—'}
                                        {order.deliveryDate && ` • Παράδοση: ${order.deliveryDate.toDate().toLocaleDateString()}`}
                                    </Typography>
                                </Box>
                                <IconButton onClick={() => onOpenOrderModal(order)} color="primary">
                                    <EditIcon />
                                </IconButton>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            )}
        </Box>
    );
}
