import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Autocomplete,
  TextField
} from '@mui/material';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../services/firestore';
import { useModal } from '../../context/ModalContext';
import LatestRemindersWidget from '../dashboard/LatestRemindersWidget';

export default function DashboardPage() {
  const [wineries, setWineries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentWineries, setRecentWineries] = useState([]);
  const { showModal } = useModal();

  useEffect(() => {
    const q = query(collection(db, 'wineries'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allWineries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        label: doc.data().name
      }));
      setWineries(allWineries);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleWinerySelect = async (event, selectedWinery) => {
    if (!selectedWinery) return;

    try {
      const wineryRef = doc(db, 'wineries', selectedWinery.id);
      await updateDoc(wineryRef, {
        lastOpenedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error on winery select:", error);
    }

    setRecentWineries(prev => {
      const filtered = prev.filter(w => w.id !== selectedWinery.id);
      const updated = [selectedWinery, ...filtered];
      return updated.slice(0, 5);
    });

    showModal('WINERY_PROFILE', { winery: selectedWinery });
  };

  return (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 2 }}>
    {/* Welcome Card */}
    <Paper
      sx={{
        p: 4,
        mb: 4,
        borderRadius: 2,
        textAlign: 'center',
        width: { xs: '100%', md: '100%' }  // ✅ 60% πλάτος σε desktop
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
        Καλώς ήρθες!
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
        Βρες γρήγορα το οινοποιείο που σε ενδιαφέρει.
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Autocomplete
          options={wineries}
          onChange={handleWinerySelect}
          value={null}
          getOptionLabel={(option) => option.label || ''}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Πληκτρολόγησε το όνομα ενός οινοποιείου..."
              variant="outlined"
              sx={{
                width: '100%',
                "& .MuiOutlinedInput-root": {
                  borderRadius: '50px',
                  backgroundColor: 'white'
                }
              }}
            />
          )}
        />
      )}
    </Paper>

    {/* Widgets Container */}
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 3,
        width: { xs: '100%', md: '100%' },  // ✅ 60% πλάτος
        mb: 4
      }}
    >
      {/* Widget 1: Υπενθυμίσεις */}
      <Box sx={{ flex: 1 }}>
        <LatestRemindersWidget />
      </Box>

      {/* Widget 2: Πρόσφατη Δραστηριότητα */}
      <Paper sx={{ p: 3, flex: 1 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Πρόσφατη Δραστηριότητα
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {recentWineries.length === 0 ? (
            <Typography color="text.secondary">
              Δεν έχεις επιλέξει ακόμα κάποιο οινοποιείο.
            </Typography>
          ) : (
            recentWineries.map((winery) => (
              <Box
                key={winery.id}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
                onClick={() => showModal('WINERY_PROFILE', { winery })}
              >
                <Typography variant="body1" sx={{ fontWeight: 'normal' }}>
                  {winery.name}
                </Typography>
                {winery.region && (
                  <Typography variant="body2" color="text.secondary">
                    {winery.region}
                  </Typography>
                )}
              </Box>
            ))
          )}
        </Box>
      </Paper>
    </Box>
  </Box>
);
}