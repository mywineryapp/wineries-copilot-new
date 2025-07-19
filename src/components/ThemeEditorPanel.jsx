import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  Select,
  MenuItem
} from '@mui/material';
import { SketchPicker } from 'react-color';
import { tokens as defaultTokens } from '../theme/tokens';

const LOCAL_KEY = 'savedThemes';

export default function ThemeEditorPanel({ onUpdate }) {
  const [colors, setColors] = useState(defaultTokens.color);
  const [themeName, setThemeName] = useState('');
  const [savedThemes, setSavedThemes] = useState({});
  const [selectedSaved, setSelectedSaved] = useState('');

  // Φόρτωση αποθηκευμένων themes
  useEffect(() => {
    const data = localStorage.getItem(LOCAL_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      setSavedThemes(parsed);
    }
  }, []);

  // Ενημέρωση parent όταν αλλάζουν τα χρώματα
  useEffect(() => {
    if (onUpdate) onUpdate({ ...defaultTokens, color: colors });
  }, [colors]);

  const handleColorChange = (key, color) => {
    const updated = { ...colors, [key]: color.hex };
    setColors(updated);
  };

  const saveTheme = () => {
    if (!themeName) return;
    const updatedThemes = {
      ...savedThemes,
      [themeName]: { ...defaultTokens, color: colors }
    };
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updatedThemes));
    setSavedThemes(updatedThemes);
    setThemeName('');
  };

  const loadSavedTheme = (name) => {
    const theme = savedThemes[name];
    if (theme) {
      setColors(theme.color);
      setSelectedSaved(name);
    }
  };

  const deleteTheme = (name) => {
    const updatedThemes = { ...savedThemes };
    delete updatedThemes[name];
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updatedThemes));
    setSavedThemes(updatedThemes);
    setSelectedSaved('');
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>🎛️ Custom Theme Editor</Typography>

      {/* 🎨 Pickers */}
      <Stack spacing={4} sx={{ mb: 4 }}>
        {Object.entries(colors).map(([key, value]) => (
          <Box key={key}>
            <Typography variant="subtitle2" gutterBottom>{key}: {value}</Typography>
            <SketchPicker
              color={value}
              onChangeComplete={(color) => handleColorChange(key, color)}
            />
          </Box>
        ))}
      </Stack>

      {/* 📝 Theme Name + Save */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Όνομα Theme"
          value={themeName}
          onChange={(e) => setThemeName(e.target.value)}
        />
        <Button variant="contained" onClick={saveTheme}>Αποθήκευση</Button>
      </Stack>

      {/* 📂 Saved Themes */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2">📂 Αποθηκευμένα Themes:</Typography>
        <Select
          value={selectedSaved}
          displayEmpty
          onChange={(e) => loadSavedTheme(e.target.value)}
          fullWidth
        >
          <MenuItem value=""><em>Επέλεξε theme</em></MenuItem>
          {Object.keys(savedThemes).map((name) => (
            <MenuItem key={name} value={name}>{name}</MenuItem>
          ))}
        </Select>
        {selectedSaved && (
          <Button
            sx={{ mt: 1 }}
            color="error"
            onClick={() => deleteTheme(selectedSaved)}
          >
            Διαγραφή "{selectedSaved}"
          </Button>
        )}
      </Box>
    </Box>
  );
}