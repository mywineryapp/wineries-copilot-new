import React, { useState, useMemo } from 'react';
import { Box, Paper, CircularProgress, Alert, Backdrop, Button } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firestore';
import OrderToolbar from './OrderToolbar';
import OrderTable from './OrderTable';
import OrderModalWrapper from './OrderModalWrapper';

const filterOrders = (orders, searchTerm) => {
    if (!searchTerm) return orders;
    const term = searchTerm.toLowerCase();
    return orders.filter(order =>
        (typeof order.wineryName === 'object'
            ? order.wineryName.name?.toLowerCase().includes(term)
            : (order.wineryName || '').toLowerCase().includes(term)
        )
        || order.products?.some(p =>
            (p.name || p.productName || p.wineTypeId || '').toLowerCase().includes(term)
        )
    );
};

export default function OrderListPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOrder, setModalOrder] = useState(undefined);
    const [modalLoading, setModalLoading] = useState(false);

    // Load all orders on mount
    React.useEffect(() => {
        setLoading(true);
        getDocs(collection(db, 'orders'))
            .then(snapshot => {
                setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setLoading(false);
            })
            .catch(e => {
                setError('Σφάλμα φόρτωσης παραγγελιών!');
                setLoading(false);
            });
    }, []);

    const filteredOrders = useMemo(() => filterOrders(orders, searchTerm), [orders, searchTerm]);

    const handleRowClick = (order) => setModalOrder(order);

    // Καλείται μετά από save σε modal (και για ΝΕΑ και για Επεξεργασία)
    const handleSaveSuccess = () => {
        setModalOrder(undefined);
        setLoading(true);
        getDocs(collection(db, 'orders')).then(snapshot => {
            setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
    };

    // 👉 ΝΕΟ: Νέα Παραγγελία!
    const handleNewOrder = () => {
        setModalOrder(null);
    };

    return (
        <>
            <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={modalLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
            <Paper sx={{ p: 3, width: '100%', borderRadius: 2, maxWidth: 1100, mx: 'auto', mt: 6 }}>
                {/* Νέα παραγγελία */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button variant="contained" onClick={handleNewOrder} sx={{ fontWeight: 600, borderRadius: 2 }}>
                        Νέα Παραγγελία
                    </Button>
                </Box>
                <OrderToolbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : (
                    <OrderTable
                        orders={filteredOrders}
                        onRowClick={handleRowClick}
                        reloadOrders={handleSaveSuccess}
                    />
                )}
            </Paper>
            <OrderModalWrapper
                order={modalOrder}
                open={modalOrder !== undefined}
                onClose={() => setModalOrder(undefined)}
                onSaveSuccess={handleSaveSuccess}
            />
        </>
    );
}
