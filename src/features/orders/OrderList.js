import {
  Box, Typography, Button, TextField, MenuItem, Select, InputLabel,
  FormControl, Paper, Stack, IconButton
} from '@mui/material';
import { useState, useEffect } from 'react';
import OrderModalWrapper from './OrderModalWrapper';
import { getFirestore, collection, query, getDocs } from 'firebase/firestore';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

export default function OrdersList({ customerId, customerName }) {
  const db = getFirestore();
  const [orders, setOrders] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(undefined);

  const fetchOrders = async () => {
    try {
      const snapshot = await getDocs(query(collection(db, 'orders')));
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      const filtered = docs.filter(o =>
        o.customerId === customerId &&
        (!statusFilter || o.status === statusFilter) &&
        (searchText === '' || o.products.some(p => p.name?.toLowerCase().includes(searchText.toLowerCase())))
      );
      setOrders(filtered);
    } catch (e) {
      console.error('Error fetching orders:', e);
    }
  };

  useEffect(() => {
    if (customerId) fetchOrders();
  }, [customerId, searchText, statusFilter]);

  const handleCloseModal = () => {
    setSelectedOrder(undefined);
  };

  const handleSaveSuccess = () => {
    setSelectedOrder(undefined);
    fetchOrders(); // Επαναφόρτωση μετά την αποθήκευση
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6">Παραγγελίες</Typography>

      {/* 🔍 Search & Filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
        <TextField
          label="Αναζήτηση προϊόντος"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          fullWidth
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Κατάσταση</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Κατάσταση"
          >
            <MenuItem value="">Όλες</MenuItem>
            <MenuItem value="Εκκρεμεί">Εκκρεμεί</MenuItem>
            <MenuItem value="Ολοκληρώθηκε">Ολοκληρώθηκε</MenuItem>
            <MenuItem value="Ακυρώθηκε">Ακυρώθηκε</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setSelectedOrder(null)}>
          Νέα Παραγγελία
        </Button>
      </Stack>

      {/* 📦 Παραγγελίες */}
      <Stack spacing={2} sx={{ mt: 3 }}>
        {orders.map((order) => (
          <Paper key={order.id} sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle1">#{order.id}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.products.length} προϊόντα • {order.orderDate?.toDate?.().toLocaleDateString?.() || order.orderDate}
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedOrder(order)} color="primary">
                <EditIcon />
              </IconButton>
            </Stack>
          </Paper>
        ))}
        {orders.length === 0 && <Typography variant="body2">Δεν βρέθηκαν παραγγελίες.</Typography>}
      </Stack>

      {/* 🛠️ Modal */}
      <OrderModalWrapper
        order={selectedOrder}
        open={selectedOrder !== undefined}
        onClose={handleCloseModal}
        onSaveSuccess={handleSaveSuccess}
        customerId={customerId}
        customerName={customerName}
      />
    </Box>
  );
}
