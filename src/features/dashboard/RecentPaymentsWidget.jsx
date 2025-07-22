import React from 'react';
import { 
    Box, Typography, Paper, List, ListItemButton, ListItemText, 
    Divider, Stack, Skeleton
} from '@mui/material';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import { useModal } from '../../context/ModalContext';

const WidgetSkeleton = () => (
    <Stack spacing={1} sx={{p: 1}}>
        {[...Array(3)].map((_, i) => (
             <Stack direction="row" alignItems="center" spacing={2} key={i}>
                <Box sx={{width: '100%'}}>
                    <Skeleton variant="text" width="70%" />
                    <Skeleton variant="text" width="50%" />
                </Box>
            </Stack>
        ))}
    </Stack>
);

export default function RecentPaymentsWidget({ communications, loading }) {
    const { showModal } = useModal();

    const handleItemClick = (comm) => {
        showModal('COMMUNICATION_EDIT', { communication: comm });
    };

    return (
        <Paper sx={{ p: 2, height: '100%', borderRadius: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <PhoneInTalkIcon color="primary" />
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 500 }}>
                    Τελευταίες Κλήσεις Πληρωμών
                </Typography>
            </Stack>
            <Divider />
            {loading ? <WidgetSkeleton /> : (
                <List dense sx={{p: 0, pt: 1}}>
                    {communications.length > 0 ? communications.map(comm => (
                        <ListItemButton key={comm.id} onClick={() => handleItemClick(comm)}>
                            <ListItemText
                                primaryTypographyProps={{fontWeight: 'medium'}}
                                primary={comm.wineryName}
                                secondary={`Από: ${comm.salespersonName || '-'}`}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{flexShrink: 0}}>
                                {comm.contactDate?.toDate().toLocaleDateString('el-GR') || '-'}
                            </Typography>
                        </ListItemButton>
                    )) : (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Δεν υπάρχουν πρόσφατες επικοινωνίες για πληρωμές.
                            </Typography>
                        </Box>
                    )}
                </List>
            )}
        </Paper>
    );
}