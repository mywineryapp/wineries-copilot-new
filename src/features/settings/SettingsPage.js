import React, { useContext, useState, useEffect } from 'react';
import {
    Container, Typography, Divider, Box, Tabs, Tab,
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import ReferenceList from './ReferenceList';
import { wineryThemes } from '../../theme/wineryPalettes';
import { ThemeContext } from '../../theme/muiThemes';
import { formatLabel } from '../../utils/greek';

export default function SettingsPage() {
    const { selectedWinery, setSelectedWinery } = useContext(ThemeContext);
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleWineryChange = (e) => {
        setSelectedWinery(e.target.value);
    };

    // ✅✅✅ Αφαιρέσαμε τις περιττές λίστες από εδώ ✅✅✅
    const referenceData = [
        { path: 'salespeople', label: 'Πωλητές', enableActive: true, enableSortOrder: true },
        { path: 'communicationPurposes', label: 'Σκοποί Επικοινωνίας', enableActive: true, enableSortOrder: true },
        { path: 'communicationMethods', label: 'Μέσα Επικοινωνίας', enableActive: true, enableSortOrder: true },
        { path: 'closureTypes', label: 'Τύποι Πωμάτων', enableActive: true, enableSortOrder: true },
        { path: 'bottleTypes', label: 'Τύποι Φιαλών', enableActive: true, enableSortOrder: true },
        { path: 'bottleCompanies', label: 'Εταιρείες Φιαλών', enableActive: false, enableSortOrder: false }
    ];

    useEffect(() => {
        if (activeTab >= referenceData.length) {
            setActiveTab(referenceData.length - 1);
        }
    }, [referenceData.length, activeTab]);


    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
            <Typography variant="h4" gutterBottom>
                Ρυθμίσεις Συστήματος
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <FormControl fullWidth sx={{ mb: 4 }}>
                <InputLabel>Winery Theme</InputLabel>
                <Select value={selectedWinery} label="Winery Theme" onChange={handleWineryChange}>
                    {Object.keys(wineryThemes).map((key) => (
                        <MenuItem key={key} value={key}>{formatLabel(key)}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Box sx={{ mt: 4 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    {referenceData.map((item) => (
                        <Tab key={item.path} label={formatLabel(item.label)} />
                    ))}
                </Tabs>
                <Box sx={{ pt: 4 }}>
                    <ReferenceList
                        key={referenceData[activeTab].path}
                        path={referenceData[activeTab].path}
                        label={referenceData[activeTab].label}
                        enableActive={referenceData[activeTab].enableActive}
                        enableSortOrder={referenceData[activeTab].enableSortOrder}
                    />
                </Box>
            </Box>
        </Container>
    );
}