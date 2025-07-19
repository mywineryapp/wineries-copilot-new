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
// Το OrderEditModal δεν χρειάζεται πλέον να εισάγεται εδώ,
// καθώς θα το χειρίζεται το parent component
// import OrderEditModal from '../modals/OrderEditModal';


// Προσθήκη onOpenOrderModal στα props
export default function WineryOrdersSection({ winery, setEditMode, onOpenOrderModal }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Δεν χρειάζονται πλέον αυτά τα states,
    // καθώς το modal θα διαχειρίζεται το parent component
    // const [selectedOrder, setSelectedOrder] = useState(null);
    // const [modalOpen, setModalOpen] = useState(false);

    // Ελέγχει για ένα event για ανανέωση των παραγγελιών
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
    }, [winery]); // Πρόσθεσα winery σαν dependency για να ξανατρέχει όταν αλλάζει το οινοποιείο

    const fetchOrders = async () => {
        if (!winery?.id) {
            setLoading(false); // Προσθήκη για να μην κολλάει στο loading αν δεν υπάρχει winery.id
            return;
        }

        try {
            const q = query(collection(db, 'orders'), where('wineryId', '==', winery.id));
            const snapshot = await getDocs(q);
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Ταξινομούμε τις παραγγελίες με βάση την ημερομηνία παραγγελίας (πιο πρόσφατη πρώτη)
            docs.sort((a, b) => (b.orderDate?.toDate?.() || 0) - (a.orderDate?.toDate?.() || 0));
            setOrders(docs);
        } catch (err) {
            console.error('Σφάλμα κατά το fetch των παραγγελιών:', err);
        } finally {
            setLoading(false);
        }
    };

    // Οι παρακάτω συναρτήσεις δεν χρειάζονται πλέον εδώ,
    // καθώς ο χειρισμός του modal γίνεται στο parent component
    // const handleOpenModal = (order = null) => {
    //     setSelectedOrder(order);
    //     setModalOpen(true);
    // };

    // const handleCloseModal = () => {
    //     setSelectedOrder(null);
    //     setModalOpen(false);
    // };

    // const handleSaveSuccess = () => {
    //     handleCloseModal();
    //     setLoading(true);
    //     fetchOrders();
    // };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">📦 Παραγγελίες Οινοποιείου</Typography>
                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    // Αλλαγή εδώ για νέο order
                    onClick={() => onOpenOrderModal(null)}
                >
                    Νέα Παραγγελία
                </Button>
            </Stack>

            {orders.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                    Δεν βρέθηκαν παραγγελίες για αυτό το οινοποιείο.
                </Typography>
            ) : (
                <Stack spacing={2}>
                    {orders.map((order) => (
                        <Paper key={order.id} sx={{ p: 2 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="subtitle1">Παραγγελία #{order.id.substring(0, 8)}</Typography> {/* Σύντομο ID για εμφάνιση */}
                                    <Typography variant="body2" color="text.secondary">
                                        Προϊόντα: {order.products?.length || 0} • Ημερομηνία Παραγγελίας: {order.orderDate?.toDate?.().toLocaleDateString?.() || '—'}
                                        {order.deliveryDate && ` • Παράδοση: ${order.deliveryDate.toDate().toLocaleDateString()}`}
                                    </Typography>
                                </Box>
                                {/* Αλλαγή εδώ για υπάρχον order */}
                                <IconButton onClick={() => onOpenOrderModal(order)} color="primary">
                                    <EditIcon />
                                </IconButton>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            )}

            {/* Το OrderEditModal δεν πρέπει πλέον να είναι εδώ.
                Θα πρέπει να το χειρίζεται το parent component που καλεί το WineryOrdersSection. */}
            {/* {modalOpen && (
                <OrderEditModal
                    open={modalOpen}
                    onClose={handleCloseModal}
                    order={selectedOrder}
                    wineryId={winery?.id}
                    wineryName={winery?.name}
                    db={db}
                    onSaveSuccess={handleSaveSuccess}
                    BackdropProps={{
                        style: {
                            backgroundColor: 'rgba(0, 0, 0, 0.7)' // Σκούρο μαύρο με 70% αδιαφάνεια
                        }
                    }}
                />
            )} */}
        </Box>
    );
}