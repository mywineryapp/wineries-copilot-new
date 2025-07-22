import React from 'react';
import { 
    Box, Typography, Paper, List, ListItemButton, ListItemText, 
    Divider, Stack, Skeleton, Avatar
} from '@mui/material';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useModal } from '../../context/ModalContext';

const WidgetSkeleton = () => (
    <Stack spacing={1} sx={{p: 1}}>
        {[...Array(3)].map((_, i) => (
             <Stack direction="row" alignItems="center" spacing={2} key={i}>
                <Box sx={{width: '100%'}}>
                    <Skeleton variant="text" width="70%" />
                </Box>
                 <Skeleton variant="text" width="30%" />
            </Stack>
        ))}
    </Stack>
);

export default function UntouchedWineriesWidget({ wineries, loading }) {
    const { showModal } = useModal();

    const handleItemClick = (winery) => {
        showModal('WINERY_PROFILE', { winery });
    };

    const formatDateDiff = (date) => {
        if (!date || date.getFullYear() < 2000) return "Καμία επαφή";
        const diffDays = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
        if (diffDays > 365) return `> 1 έτος`;
        if (diffDays > 60) return `~${Math.floor(diffDays/30)} μήνες`;
        return `${diffDays} ημέρες`;
    };

    return (
        <Paper sx={{ p: 2, height: '100%', borderRadius: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <HourglassEmptyIcon color="primary" />
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 500 }}>
                    Χωρίς Επαφή (2+ μήνες)
                </Typography>
            </Stack>
            <Divider />
            {loading ? <WidgetSkeleton /> : (
                <List dense sx={{p: 0, pt: 1}}>
                    {wineries.length > 0 ? wineries.map(winery => (
                        <ListItemButton key={winery.id} onClick={() => handleItemClick(winery)}>
                            <ListItemText
                                primaryTypographyProps={{fontWeight: 'medium'}}
                                primary={winery.name}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{flexShrink: 0}}>
                                {formatDateDiff(winery.lastContact)}
                            </Typography>
                        </ListItemButton>
                    )) : (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Εξαιρετική δουλειά! Δεν υπάρχουν οινοποιεία χωρίς πρόσφατη επαφή.
                            </Typography>
                        </Box>
                    )}
                </List>
            )}
        </Paper>
    );
}