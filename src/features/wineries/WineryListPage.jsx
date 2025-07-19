import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, TextField, Select, MenuItem, InputLabel,
  FormControl, Typography, CircularProgress, IconButton,
  Tooltip, Pagination, Table, TableContainer, TableHead,
  TableRow, TableCell, TableBody, Paper, Stack, Divider
} from '@mui/material';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firestore';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';
import WineryAddModal from './modals/WineryAddModal';
import { useModal } from '../../context/ModalContext';

const PAGE_SIZE = 20;

export default function WineryListPage() {
  const { showModal } = useModal();
  const [wineries, setWineries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [searchText, setSearchText] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const q = query(collection(db, 'wineries'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const allWineries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setWineries(allWineries);
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const regions = useMemo(() => [...new Set(wineries.map(w => w.geographicArea).filter(Boolean))].sort((a,b) => a.localeCompare(b, 'el')), [wineries]);
  const counties = useMemo(() => [...new Set(wineries.map(w => w.county).filter(Boolean))].sort((a,b) => a.localeCompare(b, 'el')), [wineries]);
  const cities = useMemo(() => [...new Set(wineries.map(w => w.location).filter(Boolean))].sort((a,b) => a.localeCompare(b, 'el')), [wineries]);

  const filteredWineries = useMemo(() => wineries.filter(w => {
    const matchesRegion = selectedRegion === '__none__' ? !w.geographicArea : (selectedRegion ? w.geographicArea === selectedRegion : true);
    const matchesCounty = selectedCounty === '__none__' ? !w.county : (selectedCounty ? w.county === selectedCounty : true);
    const matchesCity = selectedCity === '__none__' ? !w.location : (selectedCity ? w.location === selectedCity : true);

    return w.name?.toLowerCase().includes(searchText.toLowerCase()) &&
           matchesRegion &&
           matchesCounty &&
           matchesCity;
  }), [wineries, searchText, selectedRegion, selectedCounty, selectedCity]);

  const pageCount = Math.ceil(filteredWineries.length / PAGE_SIZE);
  const paginatedWineries = filteredWineries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo(0, 0);
  };
  
  useEffect(() => { setCurrentPage(1); }, [searchText, selectedRegion, selectedCounty, selectedCity]);

  const handlePrint = () => { window.print(); };

  const handleOpenWineryModal = (winery) => {
      showModal('WINERY_PROFILE', { winery });
  };

  return (
    <>
      <Paper sx={{p: 3, mb: 4, borderRadius: 2, '@media print': {boxShadow: 'none', border: 'none'} }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb: 2}}>
          <Typography variant="h5" sx={{color: 'primary.main', fontWeight: 'bold'}}>Ευρετήριο Οινοποιείων</Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Εκτύπωση Λίστας">
              <IconButton onClick={handlePrint}><PrintIcon /></IconButton>
            </Tooltip>
            <Tooltip title="Προσθήκη Νέου Οινοποιείου">
              <IconButton color="primary" onClick={() => setIsAddModalOpen(true)} sx={{border: '1px solid', borderRadius: 2}}>
                  <AddIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        
        {/* ✅✅✅ Η ΔΙΑΤΑΞΗ ΠΟΥ ΣΟΥ ΑΡΕΣΕ ✅✅✅ */}
        <Box sx={{ overflowX: 'auto', pb: 2 }}>
            <Stack direction="row" spacing={2} sx={{ minWidth: 850 }}>
                <TextField
                    label="Αναζήτηση..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    size="small"
                    sx={{ flex: 1, minWidth: 200 }}
                />
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Περιφέρεια</InputLabel>
                    <Select value={selectedRegion} label="Περιφέρεια" onChange={(e) => setSelectedRegion(e.target.value)}>
                        <MenuItem value="">Όλες</MenuItem>
                        <Divider />
                        {regions.map((region, i) => (<MenuItem key={i} value={region}>{region}</MenuItem>))}
                        <Divider />
                        <MenuItem value="__none__"><em>-- Χωρίς Καταχώρηση --</em></MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Νομός</InputLabel>
                    <Select value={selectedCounty} label="Νομός" onChange={(e) => setSelectedCounty(e.target.value)}>
                        <MenuItem value="">Όλοι</MenuItem>
                        <Divider />
                        {counties.map((county, i) => (<MenuItem key={i} value={county}>{county}</MenuItem>))}
                        <Divider />
                        <MenuItem value="__none__"><em>-- Χωρίς Καταχώρηση --</em></MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Πόλη</InputLabel>
                    <Select value={selectedCity} label="Πόλη" onChange={(e) => setSelectedCity(e.target.value)}>
                        <MenuItem value="">Όλες</MenuItem>
                        <Divider />
                        {cities.map((city, i) => (<MenuItem key={i} value={city}>{city}</MenuItem>))}
                        <Divider />
                        <MenuItem value="__none__"><em>-- Χωρίς Καταχώρηση --</em></MenuItem>
                    </Select>
                </FormControl>
            </Stack>
        </Box>
      </Paper>

      {loading ? ( <Box sx={{ mt: 6, textAlign: 'center' }}><CircularProgress /></Box> ) : (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Όνομα Οινοποιείου</TableCell>
                  <TableCell>Περιφέρεια</TableCell>
                  <TableCell>Νομός</TableCell>
                  <TableCell>Πόλη</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedWineries.map(winery => (
                  <TableRow hover key={winery.id} sx={{cursor: 'pointer'}} onClick={() => handleOpenWineryModal(winery)}>
                    <TableCell sx={{fontWeight: 'medium', color: 'primary.main'}}>{winery.name}</TableCell>
                    <TableCell>{winery.geographicArea || '-'}</TableCell>
                    <TableCell>{winery.county || '-'}</TableCell>
                    <TableCell>{winery.location || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack spacing={2} sx={{ mt: 3, alignItems: 'center', '@media print': {display: 'none'} }}>
            <Pagination count={pageCount} page={currentPage} onChange={handlePageChange} color="primary" />
          </Stack>
        </>
      )}

      {isAddModalOpen && (
        <WineryAddModal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      )}
    </>
  );
}