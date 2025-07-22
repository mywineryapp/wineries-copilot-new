import React from 'react';
import { 
    Typography, Paper, Stack, Button, Divider, Box
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PhoneForwardedIcon from '@mui/icons-material/PhoneForwarded';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import { useModal } from '../../context/ModalContext';
import { useNavigate } from 'react-router-dom';

const ActionButton = ({ icon, text, onClick }) => (
    <Button
        variant="text"
        onClick={onClick}
        size="large"
        sx={{
            justifyContent: 'flex-start',
            textAlign: 'left',
            p: 2,
            color: 'text.primary',
            '&:hover': { backgroundColor: 'action.hover' }
        }}
    >
        <Box component="span" sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
            {icon}
        </Box>
        {text}
    </Button>
);

export default function QuickActionsWidget() {
    const { showModal } = useModal();
    const navigate = useNavigate();

    const handleNewCommunication = () => showModal('COMMUNICATION_EDIT', {});
    const handleNewOrder = () => showModal('ORDER_EDIT', { order: null });
    const handleSearchInvoice = () => navigate('/invoices/search');

    return (
        <Paper sx={{ p: 2, height: '100%', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                {/* ✅ ΑΙΣΘΗΤΙΚΗ ΑΛΛΑΓΗ ΕΔΩ */}
                <AddCircleOutlineIcon color="primary" />
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 500 }}>
                    Γρήγορες Ενέργειες
                </Typography>
            </Stack>
            <Divider sx={{ mb: 1 }}/>
            <Stack spacing={1} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                <ActionButton icon={<PhoneForwardedIcon />} text="Νέα Επικοινωνία" onClick={handleNewCommunication} />
                <ActionButton icon={<AddShoppingCartIcon />} text="Νέα Παραγγελία" onClick={handleNewOrder} />
                <ActionButton icon={<SearchIcon />} text="Αναζήτηση Τιμολογίου" onClick={handleSearchInvoice} />
            </Stack>
        </Paper>
    );
}