import {
  Paper,
  Typography,
  Stack,
  Checkbox,
  Chip,
  CircularProgress // Προσθέτουμε CircularProgress για loading state
} from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import TodayIcon from '@mui/icons-material/Today';
import PersonIcon from '@mui/icons-material/Person';
// import { useState } from 'react'; // <-- Αυτό δεν χρειάζεται πλέον
// import OrderEditModal from '../orders/OrderEditModal'; // <-- Αφαιρέθηκε η εισαγωγή του, αφού δεν χρησιμοποιείται

// Προσθέτουμε το setEditMode στα props του component
export default function WineryCommunicationSection({ communications = [], winery, setEditMode }) {
  // const [editMode, setEditMode] = useState(null); // <-- Αυτό αφαιρέθηκε
  // const openEdit = () => setEditMode('communications'); // <-- Αυτό αλλάζει

  // Όλες οι κλήσεις των Hooks (εδώ μόνο το useState) στην αρχή, ανεξάρτητα.
  // ... (δεν υπάρχουν άλλα hooks εκτός από το useState που αφαιρέθηκε)

  // Τώρα, κάνουμε τον έλεγχο και το return για την κατάσταση φόρτωσης
  // ΑΦΟΥ έχουν κληθεί όλα τα Hooks (αν υπήρχαν).
  if (!winery || !winery.id) {
    return (
      <Paper elevation={2} sx={{ p: 2, mb: 3, textAlign: 'center', minHeight: 150, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={24} sx={{ mb: 2 }} />
        <Typography color="text.secondary">
          Φόρτωση στοιχείων επικοινωνίας οινοποιείου...
        </Typography>
      </Paper>
    );
  }

  const reasonColors = {
    'Πληρωμή': 'error',
    'Τακτική Επαφή': 'primary',
    'Επίσκεψη': 'success'
  };

  // Η handleOpenEdit συνάρτηση καλεί το setEditMode που έρχεται από τα props
  const handleOpenEdit = () => {
    setEditMode('communications'); // Αυτό θα ενημερώσει το γονικό component να ανοίξει το κατάλληλο modal
  };

  return (
    <>
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 3,
          cursor: 'pointer',
          backgroundColor: '#fff',
          border: (theme) => `1px solid ${theme.palette.primary.main}`,
          borderRadius: 2
        }}
        onClick={handleOpenEdit} // Χρησιμοποιούμε τη νέα handleOpenEdit
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          💬 Επικοινωνίες Οινοποιείου
        </Typography>

        {communications.length === 0 ? (
          <Typography variant="body2" color="text.disabled">
            — Δεν υπάρχουν καταγεγραμμένες επικοινωνίες
          </Typography>
        ) : (
          <Stack spacing={2}>
            {communications.map((com, i) => (
              <Paper
                key={i}
                elevation={0}
                sx={{
                  p: 2,
                  backgroundColor: '#fff',
                  border: (theme) => `1px solid ${theme.palette.primary.main}`,
                  borderRadius: 2
                }}
              >
                <Stack spacing={1}>
                  <Typography variant="subtitle2">
                    <TodayIcon fontSize="small" /> {com.date}
                  </Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {com.reason?.split(',').map((r, j) => ( // Χρησιμοποιούμε optional chaining εδώ για ασφάλεια
                      <Chip
                        key={j}
                        label={r.trim()}
                        color={reasonColors[r.trim()] || 'default'}
                        size="small"
                      />
                    ))}
                  </Stack>

                  <Typography variant="body2">
                    <PersonIcon fontSize="small" /> {com.contactWith || '—'} • Θέμα: {com.subject || '—'}
                  </Typography>

                  <Typography variant="body2">
                    Σχόλια: {com.comments || '—'}
                  </Typography>

                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Checkbox checked={com.openTopic} disabled />
                    <Typography variant="body2">
                      {com.openTopic ? 'Το θέμα είναι ανοιχτό' : 'Το θέμα έχει κλείσει'}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>

      {/* Το OrderEditModal αφαιρέθηκε από εδώ, καθώς δεν είναι το σωστό modal για αυτή την ενότητα.
          Το γονικό component (WineryProfileModal) θα είναι υπεύθυνο να ανοίξει το
          κατάλληλο modal επικοινωνιών όταν το setEditMode('communications') κληθεί.
      */}
    </>
  );
}