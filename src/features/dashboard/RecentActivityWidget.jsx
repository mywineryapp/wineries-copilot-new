import React from 'react';
import { Typography, Paper, List, ListItemButton, ListItemText, Divider, Stack, ListItemAvatar, Avatar, Box, Skeleton } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import WineBarIcon from '@mui/icons-material/WineBar';
import { useModal } from '../../context/ModalContext';

const WidgetSkeleton = () => (
    <Stack spacing={1} sx={{p: 1}}>
        {[...Array(3)].map((_, i) => (
             <Stack direction="row" alignItems="center" spacing={2} key={i}>
                <Skeleton variant="circular" width={32} height={32} />
                <Box sx={{width: '80%'}}>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                </Box>
            </Stack>
        ))}
    </Stack>
);

// ✅ Δέχεται πλέον `recentActivity` και `loading` ως props
export default function RecentActivityWidget({ recentActivity, loading }) {
    const { showModal } = useModal();

    const handleItemClick = (winery) => {
        showModal('WINERY_PROFILE', { winery });
    };

    return (
        <Paper sx={{ p: 2, height: '100%', borderRadius: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <Avatar sx={{ bgcolor: 'secondary.light' }}>
                    <HistoryIcon sx={{color: 'secondary.dark'}}/>
                </Avatar>
                <Typography variant="h6">Πρόσφατη Δραστηριότητα</Typography>
            </Stack>
            <Divider />
            {loading ? <WidgetSkeleton /> : (
                <List dense sx={{p: 0, pt: 1}}>
                    {recentActivity.length > 0 ? recentActivity.map(winery => (
                        <ListItemButton key={winery.id} onClick={() => handleItemClick(winery)}>
                             <ListItemAvatar>
                                <Avatar sx={{ width: 32, height: 32 }}>
                                    <WineBarIcon fontSize="small"/>
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primaryTypographyProps={{fontWeight: 'medium'}}
                                primary={winery.name}
                                secondary={winery.lastOpenedAt ? `Ανοίχτηκε: ${winery.lastOpenedAt.toDate().toLocaleDateString('el-GR')}` : 'N/A'}
                            />
                        </ListItemButton>
                    )) : (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Δεν υπάρχει πρόσφατη δραστηριότητα.
                            </Typography>
                        </Box>
                    )}
                </List>
            )}
        </Paper>
    );
}