import React from 'react';
import { Stack, Typography, FormControlLabel, Switch, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function BalanceToolbar({ filters, setFilters }) {
    return (
        <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ mb: 2 }}
        >
            <Typography variant="h4">Υπόλοιπα Πελατών</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                    placeholder="Αναζήτηση..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start"><SearchIcon /></InputAdornment>
                        ),
                    }}
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={filters.showOverdueOnly}
                            onChange={(e) => setFilters(prev => ({ ...prev, showOverdueOnly: e.target.checked }))}
                            color="warning"
                        />
                    }
                    label="Καθυστερημένα (61+ ημ. & > 50€)"
                    sx={{ flexShrink: 0 }}
                />
            </Stack>
        </Stack>
    );
}