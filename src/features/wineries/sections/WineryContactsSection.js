import { Typography, Stack, Box, Link, Divider, Button } from '@mui/material'; // Προστέθηκε Button από Material-UI
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

// ΝΕΑ ΠΡΟΣΘΗΚΗ: Import του EditIconButton
import { EditIconButton } from '../../../components/buttons'; // Υποθέτω ότι αυτό είναι το σωστό path και export


export default function WineryContactsSection({ contacts, setEditMode }) {
  const filteredContacts = contacts?.filter(c =>
    c.name || c.role || c.phone || c.email
  ) || [];

  return (
    <Box
      sx={{
        px: 1,
        py: 1,
        position: 'relative', // Προστέθηκε για να τοποθετηθεί το κουμπί επεξεργασίας
      }}
    >
      {/* Κουμπί επεξεργασίας στην πάνω δεξιά γωνία */}
      {/* Χρησιμοποιούμε το custom EditIconButton */}
      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
          <EditIconButton onClick={() => setEditMode('contacts')} />
      </Box>

      {filteredContacts.length === 0 ? (
        <Box sx={{ minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 1 }}>
            Κάντε κλικ στο εικονίδιο επεξεργασίας για προσθήκη/επεξεργασία υπευθύνων.
          </Typography>
          {/* Μπορούμε να προσθέσουμε ένα κουμπί εδώ αν θέλεις εκτός από το εικονίδιο */}
          {/* <Button onClick={() => setEditMode('contacts')} variant="outlined">Προσθήκη Επαφών</Button> */}
        </Box>
      ) : (
        <Stack spacing={2}>
          {filteredContacts.map((contact, index) => (
            <Box key={contact.id || index}>
              {index > 0 && <Divider sx={{ my: 1.5 }} />}

              {/* Όνομα και Ρόλος */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <PersonIcon color="primary" sx={{ fontSize: '1.5rem' }} />
                <Stack>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {contact.name}
                  </Typography>
                  {contact.role && (
                    <Typography variant="body2" color="text.secondary">
                      {contact.role}
                    </Typography>
                  )}
                </Stack>
              </Box>

              {/* Τηλέφωνο */}
              {contact.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 0.5 }}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Link href={`tel:${contact.phone}`} color="text.primary" underline="hover">
                    {contact.phone}
                  </Link>
                </Box>
              )}

              {/* Email */}
              {contact.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 0.5, mt: (contact.phone ? 0.5 : 0) }}>
                  <EmailIcon fontSize="small" color="action" />
                  <Link href={`mailto:${contact.email}`} color="text.primary" underline="hover">
                    {contact.email}
                  </Link>
                </Box>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}