import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress,
  Stack, Pagination, TextField
} from '@mui/material';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firestore';
import { useModal } from '../../context/ModalContext'; // ✅ Προσθέτουμε το useModal

const PAGE_SIZE = 25;

const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return '-';
    return timestamp.toDate().toLocaleDateString('el-GR');
};

export default function InvoicesListPage() {
  const { showModal } = useModal(); // ✅ Για να ανοίγουμε το νέο modal
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const q = query(collection(db, 'invoices'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const allInvoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInvoices(allInvoices);
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ✅✅✅ ΝΕΑ ΛΟΓΙΚΗ ΟΜΑΔΟΠΟΙΗΣΗΣ ✅✅✅
  const groupedInvoices = useMemo(() => {
      const groups = {};
      
      const invoicesToDisplay = invoices.filter(inv => 
          inv.wineryName?.toLowerCase().includes(searchText.toLowerCase()) ||
          inv.productDescription?.toLowerCase().includes(searchText.toLowerCase())
      );

      invoicesToDisplay.forEach(inv => {
          const dateStr = formatDate(inv.date);
          const key = `${dateStr}-${inv.wineryId}`; // Μοναδικό κλειδί για κάθε ομάδα
          
          if (!groups[key]) {
              groups[key] = {
                  date: dateStr,
                  wineryId: inv.wineryId,
                  wineryName: inv.wineryName,
                  items: []
              };
          }
          groups[key].items.push(inv);
      });
      
      return Object.values(groups); // Μετατρέπουμε το αντικείμενο σε λίστα
  }, [invoices, searchText]);
  
  const pageCount = Math.ceil(groupedInvoices.length / PAGE_SIZE);
  const paginatedGroups = groupedInvoices.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleRowClick = (invoiceGroup) => {
      showModal('INVOICE_DETAILS', { invoiceGroup });
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction={{xs: 'column', sm: 'row'}} justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Typography variant="h4" sx={{color: 'primary.main', fontWeight: 'bold'}}>
                Λίστα Πωλήσεων / Τιμολογίων
            </Typography>
            <TextField 
                size="small"
                label="Αναζήτηση..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                sx={{minWidth: '300px'}}
            />
        </Stack>
        {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>
        ) : (
            <>
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Ημερομηνία</TableCell>
                                <TableCell>Οινοποιείο</TableCell>
                                <TableCell align="right">Πλήθος Ειδών</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedGroups.map((group, index) => (
                                <TableRow hover key={index} sx={{cursor: 'pointer'}} onClick={() => handleRowClick(group)}>
                                    <TableCell>{group.date}</TableCell>
                                    <TableCell sx={{fontWeight: 'medium'}}>{group.wineryName}</TableCell>
                                    <TableCell align="right">{group.items.length}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Stack spacing={2} sx={{ mt: 3, alignItems: 'center' }}>
                    <Pagination count={pageCount} page={currentPage} onChange={handlePageChange} color="primary" />
                </Stack>
            </>
        )}
    </Paper>
  );
}