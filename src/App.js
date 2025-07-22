import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  CssBaseline,
  CircularProgress,
  IconButton,
  Tooltip,
  Container
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';

// Contexts & Providers
import { ReferenceProvider } from './context/ReferenceContext';
import ThemeProviderWrapper from './theme/muiThemes';
import { ModalProvider } from './context/ModalContext';
import { NotificationProvider, useNotifier } from './context/NotificationContext';

// Layout & Components
import ThemeSwitcher from './theme/ThemeSwitcher';
import GlobalModalManager from './components/GlobalModalManager';
import NotificationManager from './components/NotificationManager';
import ReminderBell from './components/layout/ReminderBell';
import Sidebar from './components/layout/Sidebar';

// Pages
import DashboardPage from './features/wineries/DashboardPage';
import WineryListPage from './features/wineries/WineryListPage';

import InvoiceSearchPage from './features/invoices/Search/InvoiceSearchPage';
import CommunicationListPage from './features/communications/CommunicationListPage';
import OrderList from './features/orders/OrderList';
import BalanceReportPage from './features/balances/BalanceReportPage';
import AutomationPage from './features/system/AutomationPage';
import DataCleaningPage from './features/system/DataCleaningPage';
import SettingsPage from './features/settings/SettingsPage';
import LoginPage from './features/auth/LoginPage';

import { formatLabel } from './utils/greek';
import { useUserStore } from './store/userStore';
import { auth } from './services/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './print.css';

function AppContent() {
  const { user } = useUserStore();
  const { showNotification } = useNotifier();
  const [navOpen, setNavOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showNotification('Αποσυνδεθήκατε με επιτυχία.', 'info');
    } catch (err) {
      showNotification(`Σφάλμα κατά την αποσύνδεση: ${err.message}`, 'error');
    }
  };

  return (
    <Router>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'grey.100' }}>
        <AppBar position="static">
          <Toolbar>
            {user && (
              <IconButton
                color="inherit"
                edge="start"
                sx={{ mr: 2 }}
                onClick={() => setNavOpen(true)}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {formatLabel('Διαχείριση Οινοποιείου')}
            </Typography>
            {user && (
              <>
                <ThemeSwitcher />
                <ReminderBell />
                <Tooltip title={`Αποσύνδεση (${user.email})`}>
                  <IconButton color="inherit" onClick={handleLogout}>
                    <LogoutIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Toolbar>
        </AppBar>

        <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

        <Container component="main" maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
          <Routes>
            {user ? (
              <>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/wineries" element={<WineryListPage />} />
                
                <Route path="/communications" element={<CommunicationListPage />} />
                <Route path="/orders" element={<OrderList />} />
                <Route path="/balances" element={<BalanceReportPage />} />
                <Route path="/automations" element={<AutomationPage />} />
                <Route path="/datacleaning" element={<DataCleaningPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/invoices/search" element={<InvoiceSearchPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <Route path="*" element={<LoginPage />} />
            )}
          </Routes>
        </Container>
      </Box>
    </Router>
  );
}

export default function App() {
  const { setUser, clearUser } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, userAuth => {
      if (userAuth) {
        setUser({ uid: userAuth.uid, email: userAuth.email });
      } else {
        clearUser();
      }
      setLoading(false);
    });
    return () => unsub();
  }, [setUser, clearUser]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ReferenceProvider>
      <ThemeProviderWrapper>
        <ModalProvider>
          <NotificationProvider>
            <AppContent />
            <GlobalModalManager />
            <NotificationManager />
          </NotificationProvider>
        </ModalProvider>
      </ThemeProviderWrapper>
    </ReferenceProvider>
  );
}
