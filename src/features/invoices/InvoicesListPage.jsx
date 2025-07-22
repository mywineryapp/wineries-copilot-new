import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress,
  Stack, Pagination, TextField, InputAdornment, Alert,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../services/firestore';
import { useModal } from '../../context/ModalContext';
import { useDebounce } from '../../hooks/useDebounce';

const PAGE_SIZE = 25;

const formatDate = (timestamp) => {
  if (!timestamp || typeof timestamp.toDate !== 'function') return '-';
  try {
    return timestamp.toDate().toLocaleDateString('el-GR');
  } catch (e) {
    return '-';
  }
};

const availableYears = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2, new Date().getFullYear() - 3];

export default function InvoicesListPage({ wineryId, onRowClick }) {
  const { showModal } = useModal();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    setLoading(true);
    const invoicesRef = collection(db, 'invoices');
    const q = wineryId
      ? query(invoicesRef, where('wineryId', '==', wineryId), orderBy('date', 'desc'))
      : query(invoicesRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
        console.error("Error fetching invoices:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [wineryId]);

  const filteredAndGroupedInvoices = useMemo(() => {
    let results = invoices;

    if (selectedYear) {
        results = results.filter(inv => {
            if (!inv.date || typeof inv.date.toDate !== 'function') return false;
            try { return inv.date.toDate().getFullYear() === selectedYear; } catch { return false; }
        });
    }

    const searchWords = debouncedSearchTerm.toLowerCase().split(' ').filter(word => word.length > 0);
    if (searchWords.length > 0) {
        results = results.filter(inv => {
            const targetText = `${String(inv.wineryName || '').toLowerCase()} ${String(inv.productDescription || '').toLowerCase()}`;
            const textForNumberSearch = ` ${targetText.replace(/[,.x]/g, ' ')} `;
            return searchWords.every(word => {
                if (!isNaN(word)) { return textForNumberSearch.includes(` ${word} `); }
                return targetText.includes(word);
            });
        });
    }

    const groups = {};
    results.forEach(inv => {
      const dateStr = formatDate(inv.date);
      const key = `${dateStr}-${inv.wineryId}`;
      if (!groups[key]) {
        groups[key] = { date: dateStr, wineryId: inv.wineryId, wineryName: inv.wineryName, items: [] };
      }
      groups[key].items.push(inv);
    });

    return Object.values(groups);
  }, [invoices, debouncedSearchTerm, selectedYear]);

  const pageCount = Math.ceil(filteredAndGroupedInvoices.length / PAGE_SIZE);
  const paginatedGroups = filteredAndGroupedInvoices.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handlePageChange = (_, value) => setCurrentPage(value);
  
  const handleRowClick = (group) => {
      if (onRowClick) { onRowClick(group); } 
      else { showModal('INVOICE_DETAILS', { invoiceGroup: group }); }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedYear]);

  return (
    // ✅✅✅ ΤΟ ΠΕΡΙΤΥΛΙΓΜΑ ΠΟΥ ΠΕΡΙΟΡΙΖΕΙ ΤΟ ΠΛΑΤΟΣ ✅✅✅
    <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        
        {/* ✅✅✅ ΕΝΙΑΙΑ ΕΜΦΑΝΙΣΗ ΓΙΑ ΤΑ ΦΙΛΤΡΑ ✅✅✅ */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            {wineryId ? '' : 'Τιμολόγια'}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{width: {xs: '100%', sm: 'auto'}}}>
            {/* Το search bar θα εμφανίζεται μόνο στην κεντρική λίστα */}
            {!wineryId && (
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Αναζήτηση..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
                    }}
                />
            )}
            <FormControl size="small" sx={{minWidth: 120, width: '100%'}}>
                <InputLabel>Έτος</InputLabel>
                <Select
                    value={selectedYear}
                    label="Έτος"
                    onChange={(e) => setSelectedYear(e.target.value)}
                >
                    <MenuItem value=""><em>Όλα</em></MenuItem>
                    {availableYears.map(year => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                </Select>
            </FormControl>
          </Stack>
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
                    {/* Η στήλη θα εμφανίζεται μόνο στην κεντρική λίστα */}
                    {!wineryId && <TableCell>Οινοποιείο</TableCell>}
                    <TableCell align="right">Αρ. Ειδών</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedGroups.map((group, idx) => (
                    <TableRow hover key={idx} sx={{ cursor: 'pointer' }} onClick={() => handleRowClick(group)}>
                      <TableCell>{group.date}</TableCell>
                      {!wineryId && <TableCell sx={{ fontWeight: 'medium' }}>{group.wineryName}</TableCell>}
                      <TableCell align="right">{group.items.length}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

              {paginatedGroups.length === 0 && !loading && (
                  <Alert severity="info" sx={{mt: 2}}>Δεν βρέθηκαν τιμολόγια που να ταιριάζουν με τα κριτήριά σας.</Alert>
              )}

            {pageCount > 1 && (
              <Stack spacing={2} sx={{ mt: 3, alignItems: 'center' }}>
                <Pagination count={pageCount} page={currentPage} onChange={handlePageChange} color="primary" />
              </Stack>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}