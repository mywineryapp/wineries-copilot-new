import { AppBar, Toolbar, Typography, Box } from '@mui/material';

export default function AppLayout({ children }) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ borderRadius: 1, mb: 2 }}>
        <Toolbar>
          <Typography variant="h6" component="div">
            Διαχείριση Οινοποιείων 🍇
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ padding: 2 }}>
        {children}
      </Box>
    </Box>
  );
}