import React from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Autocomplete,
  TextField,
  Stack,
  Divider,
  Skeleton,
  Grid, // Το κρατάμε για παν ενδεχόμενο, αν και δεν θα το χρησιμοποιήσουμε για τα widgets
  Avatar
} from '@mui/material';
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firestore';
import { useModal } from '../../context/ModalContext';

import { useDashboardData } from '../dashboard/hooks/useDashboardData'; 
import LatestRemindersWidget from '../dashboard/LatestRemindersWidget';
import RecentPaymentsWidget from '../dashboard/RecentPaymentsWidget';
import QuickActionsWidget from '../dashboard/QuickActionsWidget';
import UntouchedWineriesWidget from '../dashboard/UntouchedWineriesWidget';

import WineBarIcon from '@mui/icons-material/WineBar';
import MarkUnreadChatAltIcon from '@mui/icons-material/MarkUnreadChatAlt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const formatCurrency = (num) => num.toLocaleString('el-GR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });

const StatsSkeleton = () => (
    <Stack direction={{ xs: 'column', sm: 'row' }} divider={<Divider orientation="vertical" flexItem />} spacing={2} justifyContent="space-around" alignItems="stretch">
        {[...Array(3)].map((_, i) => (
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }} key={i}>
                <Skeleton variant="circular" width={48} height={48} />
                <Box>
                    <Skeleton variant="text" width={80} height={32} />
                    <Skeleton variant="text" width={100} />
                </Box>
            </Stack>
        ))}
    </Stack>
);

export default function DashboardPage() {
  const { showModal } = useModal();
  const { stats, wineries, latestReminders, paymentComms, untouchedWineries, loading } = useDashboardData();

  const sortedYears = Object.keys(stats.salesByYear).sort((a, b) => b - a).slice(1, 4);

  const handleWinerySelect = async (event, selectedWinery) => {
    if (!selectedWinery) return;
    try {
      const wineryRef = doc(db, 'wineries', selectedWinery.id);
      await updateDoc(wineryRef, { lastOpenedAt: serverTimestamp() });
      showModal('WINERY_PROFILE', { winery: selectedWinery });
    } catch (error) {
      console.error("Error on winery select:", error);
      showModal('WINERY_PROFILE', { winery: selectedWinery });
    }
  };

  return (
    <Box>
      <Paper sx={{p: 3, mb: 3, borderRadius: 2, textAlign: 'center'}}>
        <Typography variant="h4" gutterBottom sx={{color: 'primary.main', fontWeight: 'bold'}}>
          Καλώς ήρθες!
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{mb: 3}}>
          Βρες γρήγορα το οινοποιείο που σε ενδιαφέρει.
        </Typography>

        {loading ? <CircularProgress /> : (
            <Autocomplete
              options={wineries}
              onChange={handleWinerySelect}
              value={null} 
              getOptionLabel={(option) => option.label || ''}
              renderInput={(params) => (
                <TextField {...params} label="Πληκτρολόγησε το όνομα ενός οινοποιείου..." variant="outlined" sx={{ maxWidth: '700px', mx: 'auto', "& .MuiOutlinedInput-root": { borderRadius: '50px', backgroundColor: 'white' } }} />
              )}
              noOptionsText="Δεν βρέθηκαν οινοποιεία"
            />
        )}

        <Divider sx={{my: 3}} />

        {loading ? <StatsSkeleton /> : (
            <Stack direction={{ xs: 'column', sm: 'row' }} divider={<Divider orientation="vertical" flexItem />} spacing={2} justifyContent="space-around" alignItems="stretch">
              <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                <Box sx={{ width: 48, display: 'flex', justifyContent: 'center' }}><WineBarIcon sx={{ fontSize: '2rem', color: 'primary.main' }} /></Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{stats.wineries}</Typography>
                  <Typography variant="body2" color="text.secondary">Οινοποιεία</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                <Box sx={{ width: 48, display: 'flex', justifyContent: 'center' }}><MarkUnreadChatAltIcon sx={{ fontSize: '2rem', color: 'warning.main' }} /></Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{stats.openCases}</Typography>
                  <Typography variant="body2" color="text.secondary">Ανοιχτές Υποθέσεις</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                <Box sx={{ width: 48, display: 'flex', justifyContent: 'center' }}><TrendingUpIcon sx={{ fontSize: '2rem', color: 'success.main' }} /></Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{formatCurrency(stats.salesThisYear)}</Typography>
                  <Typography variant="body2" color="text.secondary">Πωλήσεις Έτους</Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }} flexWrap="wrap">
                    {sortedYears.map(year => (
                      <Typography key={year} variant="caption">
                        {year}: <strong>{formatCurrency(stats.salesByYear[year])}</strong>
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Stack>
        )}
      </Paper>

      {/* ✅✅✅ ΝΕΑ, ΠΙΟ ΣΤΙΒΑΡΗ ΔΙΑΤΑΞΗ ΜΕ STACK ✅✅✅ */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="stretch">
        
        {/* ΑΡΙΣΤΕΡΗ ΣΤΗΛΗ */}
        <Stack direction="column" spacing={3} sx={{ flex: 1, minWidth: 0 }}>
            <QuickActionsWidget />
            <RecentPaymentsWidget communications={paymentComms} loading={loading} />
        </Stack>
        
        {/* ΔΕΞΙΑ ΣΤΗΛΗ */}
        <Stack direction="column" spacing={3} sx={{ flex: 1, minWidth: 0 }}>
            <LatestRemindersWidget reminders={latestReminders} loading={loading} />
            <UntouchedWineriesWidget wineries={untouchedWineries} loading={loading} />
        </Stack>

      </Stack>
    </Box>
  );
}