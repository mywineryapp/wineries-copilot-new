import React, { useState, useEffect, useMemo } from 'react';
import algoliasearch from 'algoliasearch/lite';
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  InputAdornment,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const availableYears = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2, new Date().getFullYear() - 3, new Date().getFullYear() - 4];

const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('el-GR');
};

export default function InvoiceSearchPage() {
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const algoliaClient = useMemo(() => {
    const appId = process.env.REACT_APP_ALGOLIA_APP_ID;
    const searchKey = process.env.REACT_APP_ALGOLIA_SEARCH_KEY;
    if (!appId || !searchKey) {
        console.error("Algolia App ID or Search Key is missing from .env.local file.");
        return null;
    }
    return algoliasearch(appId, searchKey);
  }, []);

  const algoliaIndex = useMemo(() => {
    if (!algoliaClient) return null;
    return algoliaClient.initIndex(process.env.REACT_APP_ALGOLIA_INDEX || 'algolia_invoices');
  }, [algoliaClient]);

  useEffect(() => {
    if (!algoliaIndex || (query.length < 3 && !selectedYear)) {
      setHits([]);
      setTotalPages(0);
      setLoading(false);
      return;
    }
    
    setLoading(true);

    const searchOptions = {
        hitsPerPage: 20,
        page: page
    };

    if (selectedYear) {
        const startOfYear = new Date(selectedYear, 0, 1).getTime();
        const endOfYear = new Date(selectedYear + 1, 0, 1).getTime();
        searchOptions.filters = `date >= ${startOfYear} AND date < ${endOfYear}`;
    }
    
    const searchTimer = setTimeout(() => {
        algoliaIndex
        .search(query, searchOptions)
        .then((response) => {
            setHits(response.hits);
            setTotalPages(response.nbPages);
        })
        .catch(err => {
            console.error('Algolia search error:', err);
            setHits([]);
            setTotalPages(0);
        })
        .finally(() => setLoading(false));
    }, 400);

    return () => clearTimeout(searchTimer);

  }, [query, algoliaIndex, selectedYear, page]);

  useEffect(() => {
    setPage(0);
  }, [query, selectedYear]);

  if (!algoliaClient) {
    // ✅✅✅ ΕΠΑΝΑΦΕΡΑΜΕ ΤΟΝ ΣΩΣΤΟ ΚΩΔΙΚΑ ✅✅✅
    return (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Alert severity="error">
                <Typography>Σφάλμα Ρυθμίσεων Αναζήτησης</Typography>
                Δεν βρέθηκαν τα απαραίτητα κλειδιά για τη σύνδεση με την υπηρεσία αναζήτησης. Βεβαιωθείτε ότι το αρχείο `.env.local` είναι σωστά ρυθμισμένο.
            </Alert>
        </Paper>
    );
  }

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom sx={{color: 'primary.main', fontWeight: 'bold'}}>
            Αναζήτηση Τιμολογίων
        </Typography>
        
        <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} sx={{mb: 3}}>
            <TextField
                fullWidth
                autoFocus
                placeholder="Αναζήτηση σε οινοποιείο ή προϊόν..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>), }}
            />
            <FormControl size="small" sx={{minWidth: 120}}>
                <InputLabel>Έτος</InputLabel>
                <Select value={selectedYear} label="Έτος" onChange={(e) => setSelectedYear(e.target.value)}>
                    <MenuItem value=""><em>Όλα</em></MenuItem>
                    {availableYears.map(year => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                </Select>
            </FormControl>
        </Stack>

        {loading && <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>}

        {!loading && (query.length > 2 || selectedYear) && hits.length === 0 && (
            <Alert severity="info">Δεν βρέθηκαν αποτελέσματα για τα επιλεγμένα κριτήρια.</Alert>
        )}

        {hits.length > 0 && (
            <>
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead sx={{backgroundColor: 'grey.50'}}>
                        <TableRow>
                            <TableCell sx={{fontWeight: '600'}}>Ημερ.</TableCell>
                            <TableCell sx={{fontWeight: '600'}}>Οινοποιείο</TableCell>
                            <TableCell sx={{fontWeight: '600'}}>Προϊόν</TableCell>
                            <TableCell align="right" sx={{fontWeight: '600'}}>Ποσότητα</TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                        {hits.map(hit => (
                            <TableRow key={hit.objectID} hover>
                            <TableCell>{formatDate(hit.date)}</TableCell>
                            <TableCell sx={{fontWeight: 'medium'}}>{hit.wineryName || '-'}</TableCell>
                            <TableCell>{hit.productDescription || '-'}</TableCell>
                            <TableCell align="right">{hit.quantity ?? '-'}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {totalPages > 1 && (
                    <Stack sx={{mt: 2, alignItems: 'center'}}>
                        <Pagination 
                            count={totalPages} 
                            page={page + 1}
                            onChange={(event, value) => setPage(value - 1)} 
                            color="primary" 
                        />
                    </Stack>
                )}
            </>
        )}
        </Paper>
    </Box>
  );
}