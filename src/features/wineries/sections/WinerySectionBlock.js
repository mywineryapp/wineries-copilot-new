import { Paper, Typography, Stack } from '@mui/material';

export default function WinerySectionBlock({ title, children, onClick }) {
  return (
    <Paper
      elevation={3}
      onClick={onClick}
      sx={{
        p: { xs: 2, sm: 3 },
        mb: 3,
        cursor: 'pointer',
        backgroundColor: '#fff',
        border: (theme) => `1px solid ${theme.palette.primary.main}`,
        borderRadius: 2,
        '&:hover': {
          boxShadow: 6,
          backgroundColor: '#f9f9f9',
          transition: 'all 0.2s ease-in-out',
          transform: 'translateY(-1px)',
        },
        '&:active': {
          transform: 'scale(0.98)',
          transition: 'all 0.1s ease-in-out',
        },
        transition: 'all 0.2s ease-in-out',
        touchAction: 'manipulation' // για mobile καλύτερη απόκριση
      }}
    >
      <Stack spacing={1}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.1rem' } }}
        >
          {title}
        </Typography>

        <Stack spacing={0.5}>
          {children}
        </Stack>
      </Stack>
    </Paper>
  );
}
