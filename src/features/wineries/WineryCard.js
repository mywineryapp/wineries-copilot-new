// src/features/wineries/WineryCard.js

import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Tooltip,
  Box,
  IconButton
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LanguageIcon from '@mui/icons-material/Language';
import DeleteIcon from '@mui/icons-material/Delete';
import { useModal } from '../../context/ModalContext';
import { useNotifier } from '../../context/NotificationContext';
import { doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore'; // ✅ Προστέθηκαν τα updateDoc, serverTimestamp
import { db } from '../../services/firestore';

export default function WineryCard({ winery }) {
  const { showModal } = useModal();
  const { showNotification } = useNotifier();

  // ✅✅✅ ΝΕΑ ΛΟΓΙΚΗ ΕΔΩ ✅✅✅
  const handleOpenWineryModal = async () => {
    try {
      // Ενημερώνουμε το πεδίο lastOpenedAt με την τρέχουσα ώρα του server
      const wineryRef = doc(db, 'wineries', winery.id);
      await updateDoc(wineryRef, {
        lastOpenedAt: serverTimestamp()
      });
      // Αφού ενημερωθεί, ανοίγουμε το modal
      showModal('WINERY_PROFILE', { winery: winery });
    } catch (error) {
        console.error("Error updating lastOpenedAt:", error);
        // Ακόμα κι αν αποτύχει η ενημέρωση, ανοίγουμε το modal για να μη μπλοκάρει ο χρήστης
        showModal('WINERY_PROFILE', { winery: winery });
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε το οινοποιείο "${winery.name}";`)) {
        try {
            await deleteDoc(doc(db, 'wineries', winery.id));
            showNotification('Το οινοποιείο διαγράφηκε επιτυχώς!', 'success');
        } catch (error) {
            showNotification(`Σφάλμα διαγραφής: ${error.message}`, 'error');
        }
    }
  };

  const areaColorMap = {
    'Βόρειο Αιγαίο': '#0288d1', 'Νότιο Αιγαίο': '#7b1fa2', 'Αττική': '#e53935',
    'Μακεδονία': '#43a047', 'Ήπειρος': '#6d4c41', 'Πελοπόννηsos': '#ef6c00'
  };
  const cardBorder = areaColorMap[winery.geographicArea] || '#9e9e9e';

  const phones = winery.contactInfo?.phone || [];
  const emails = winery.contactInfo?.email || [];
  const website = winery.contactInfo?.website || '';
  const name = winery.name || 'Χωρίς όνομα';
  const location = winery.location || 'Χωρίς τοποθεσία';
  const county = winery.county || 'Χωρίς νομό';
  const geographicArea = winery.geographicArea || 'Χωρίς περιοχή';

  return (
    <Card
      sx={{
        position: 'relative', backgroundColor: '#fff', borderRadius: 2, boxShadow: 4,
        mb: 4, borderLeft: `8px solid ${cardBorder}`, cursor: 'pointer',
        transition: '0.2s', '&:hover': { boxShadow: 6 },
      }}
      onClick={handleOpenWineryModal}
    >
      <CardContent sx={{ pr: '40px' }}> {/* Λίγο παραπάνω περιθώριο για το κουμπί διαγραφής */}
        <Stack spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="h6">{name}</Typography>
            <Typography variant="body2" color="text.secondary">
              <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
              {location}, {county} • {geographicArea}
            </Typography>
          </Stack>
          {(phones.length > 0 || emails.length > 0) && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, overflowX: 'auto', pr: 1, }} >
              {phones.map((phone, i) => ( <Chip key={`phone-${i}`} label={phone} size="small" icon={<PhoneIcon />} /> ))}
              {emails.map((email, i) => ( <Chip key={`email-${i}`} label={email} size="small" icon={<EmailIcon />} /> ))}
            </Box>
          )}
          {website && (
            <Tooltip title={website}>
              <Typography variant="body2" mt={1} noWrap sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', }} >
                <LanguageIcon fontSize="small" sx={{ mr: 0.5 }} />
                {website}
              </Typography>
            </Tooltip>
          )}
        </Stack>
      </CardContent>
      
      <IconButton
          aria-label="delete"
          onClick={handleDelete}
          sx={{ position: 'absolute', top: 4, right: 4, zIndex: 2 }}
      >
          <DeleteIcon fontSize="small" />
      </IconButton>
    </Card>
  );
}