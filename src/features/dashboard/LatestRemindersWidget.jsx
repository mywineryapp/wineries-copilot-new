import React from 'react';
import { 
    Box, Typography, Paper, List, ListItemButton, ListItemText, 
    Divider, Stack, Skeleton
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useModal } from '../../context/ModalContext';

// ✅✅✅ ΠΛΗΡΗΣ ΚΩΔΙΚΑΣ ΓΙΑ ΤΟ SKELETON ✅✅✅
const WidgetSkeleton = () => (
    <Stack spacing={1} sx={{p: 1}}>
        {[...Array(3)].map((_, i) => (
             <Stack direction="row" alignItems="center" spacing={2} key={i}>
                <Box sx={{width: '100%'}}>
                    <Skeleton variant="text" width="70%" />
                    <Skeleton variant="text" width="50%" />
                </Box>
                 <Skeleton variant="text" width="20%" />
            </Stack>
        ))}
    </Stack>
);

export default function LatestRemindersWidget({ reminders, loading }) {
    const { showModal } = useModal();

    const handleItemClick = (communication) => {
        showModal('COMMUNICATION_EDIT', { communication });
    };

    return (
        <Paper sx={{ p: 2, height: '100%', borderRadius: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <NotificationsActiveIcon color="primary" />
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 500 }}>
                    Επόμενες Υπενθυμίσεις
                </Typography>
            </Stack>
            <Divider />
            {loading ? <WidgetSkeleton /> : (
                <List dense sx={{p: 0, pt: 1}}>
                    {reminders.length > 0 ? reminders.map(rem => (
                        <ListItemButton key={rem.id} onClick={() => handleItemClick(rem)}>
                            <ListItemText
                                primaryTypographyProps={{fontWeight: 'medium'}}
                                primary={rem.wineryName}
                                secondary={`Σκοπός: ${rem.purposeName || '-'}`}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{flexShrink: 0}}>
                                {rem.reminderDate.toDate().toLocaleDateString('el-GR')}
                            </Typography>
                        </ListItemButton>
                    )) : (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Δεν υπάρχουν επερχόμενες υπενθυμίσεις!
                            </Typography>
                        </Box>
                    )}
                </List>
            )}
        </Paper>
    );
}