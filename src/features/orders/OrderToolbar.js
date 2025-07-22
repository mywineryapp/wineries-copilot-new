import { Box, TextField } from '@mui/material';

export default function OrderToolbar({ searchTerm, setSearchTerm }) {
    return (
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
                label="Αναζήτηση (Οινοποιείο ή Προϊόν)"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                sx={{ width: 350, maxWidth: '100%' }}
                size="small"
                autoFocus
            />
        </Box>
    );
}
