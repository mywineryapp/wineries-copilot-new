import React from 'react';
import { tokens } from '../theme/tokens';
import { Box, Typography, Stack, Paper } from '@mui/material';

export default function ThemePreviewPanel() {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>🎨 Token Preview Panel</Typography>

      {/* Colors */}
      <Typography variant="subtitle1" sx={{ mt: 2 }}>Colors</Typography>
      <Stack direction="row" spacing={2} flexWrap="wrap">
        {Object.entries(tokens.color).map(([key, value]) => (
          <Paper
            key={key}
            elevation={3}
            sx={{
              width: 120,
              height: 100,
              backgroundColor: value,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              textShadow: '0 0 3px rgba(0,0,0,0.7)',
              p: 1
            }}
          >
            <Typography variant="caption">{key}</Typography>
            <Typography variant="caption">{value}</Typography>
          </Paper>
        ))}
      </Stack>

      {/* Spacing */}
      <Typography variant="subtitle1" sx={{ mt: 3 }}>Spacing</Typography>
      <Stack direction="row" spacing={2}>
        {Object.entries(tokens.spacing).map(([key, value]) => (
          <Box
            key={key}
            sx={{
              width: value * 2,
              height: 24,
              bgcolor: 'grey.300',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="caption">{key} ({value}px)</Typography>
          </Box>
        ))}
      </Stack>

      {/* Radius */}
      <Typography variant="subtitle1" sx={{ mt: 3 }}>Border Radius</Typography>
      <Stack direction="row" spacing={2}>
        {Object.entries(tokens.radius).map(([key, value]) => (
          <Paper
            key={key}
            sx={{
              width: 80,
              height: 80,
              borderRadius: value,
              bgcolor: 'grey.200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="caption">{key} ({value}px)</Typography>
          </Paper>
        ))}
      </Stack>

      {/* Shadows */}
      <Typography variant="subtitle1" sx={{ mt: 3 }}>Shadows</Typography>
      <Stack direction="row" spacing={2}>
        {tokens.shadow?.level1 && (
          <Paper
            elevation={3}
            sx={{
              width: 140,
              height: 60,
              boxShadow: tokens.shadow.level1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="caption">level1</Typography>
          </Paper>
        )}
      </Stack>
    </Box>
  );
}