import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
    AppBar, Toolbar, Typography, Box, CssBaseline, CircularProgress, 
    IconButton, Tooltip, Container
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';

// Contexts & Providers
import { ReferenceProvider } from './context/ReferenceContext';
import ThemeProviderWrapper from './theme/muiThemes';
import { ModalProvider } from './context/ModalContext';
import { NotificationProvider, useNotifier } from './context/NotificationContext';

// Components & Layout
import ThemeSwitcher from './theme/ThemeSwitcher';
import GlobalModalManager from './components/GlobalModalManager';
import NotificationManager from './components/NotificationManager';
import ReminderBell from './components/layout/ReminderBell';
import Sidebar from './components/layout/Sidebar';

// Pages
import DashboardPage from './features/wineries/DashboardPage';
import WineryListPage from './features/wineries/WineryListPage';
import LoginPage from './features/auth/LoginPage';
import BalanceReportPage from './features/balances/BalanceReportPage';
import CommunicationListPage from './features/communications/CommunicationListPage';
import SettingsPage from './features/settings/SettingsPage';
import OrderList from './features/orders/OrderList';
import ProductReportPage from './features/reports/ProductReportPage';
import AutomationPage from './features/system/AutomationPage';
import InvoicesListPage from './features/invoices/InvoicesListPage';

// Utils, State & Auth
import { formatLabel } from './utils/greek';
import { useUserStore } from './store/userStore';
import { auth } from './services/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './print.css';

const AppContent = () => {
    const { user } = useUserStore();
    const { showNotification } = useNotifier();
    const [isNavOpen, setNavOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            showNotification('Αποσυνδεθήκατε με επιτυχία.', 'info');
        } catch (error) {
            showNotification(`Σφάλμα κατά την αποσύνδεση: ${error.message}`, 'error');
        }
    };

    return (
        <Router>
            <CssBaseline />
            <div id="app-container">
                <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'grey.100' }}>
                    <AppBar position="static" id="app-bar">
                        <Toolbar>
                            {user && (
                                <IconButton color="inherit" onClick={() => setNavOpen(true)} edge="start" sx={{ mr: 2 }}>
                                    <MenuIcon />
                                </IconButton>
                            )}
                            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                                {formatLabel('Διαχείριση Οινοποιείου')}
                            </Typography>
                            
                            {user && (
                                <>
                                    <ThemeSwitcher />
                                    <ReminderBell />
                                    <Tooltip title={`Αποσύνδεση (${user.email})`}>
                                        <IconButton color="inherit" onClick={handleLogout}><LogoutIcon /></IconButton>
                                    </Tooltip>
                                </>
                            )}
                        </Toolbar>
                    </AppBar>

                    <Sidebar open={isNavOpen} onClose={() => setNavOpen(false)} />

                    <Container component="main" maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
                        <div id="printableArea">
                            <Routes>
                                {user ? (
                                    <>
                                        <Route path="/" element={<DashboardPage />} />
                                        <Route path="/wineries" element={<WineryListPage />} />
                                        <Route path="/communications" element={<CommunicationListPage />} />
                                        <Route path="/balances" element={<BalanceReportPage />} />
                                        <Route path="/orders" element={<OrderList />} />
                                        <Route path="/settings" element={<SettingsPage />} />
                                        <Route path="/reports/products" element={<ProductReportPage />} />
                                        <Route path="/automations" element={<AutomationPage />} />
                                        <Route path="/invoices" element={<InvoicesListPage />} />
                                        <Route path="*" element={<Navigate to="/" />} />
                                    </>
                                ) : (
                                    <Route path="*" element={<LoginPage />} />
                                )}
                            </Routes>
                        </div>
                    </Container>
                </Box>
            </div>
        </Router>
    );
};

export default function App() {
    const { setUser, clearUser } = useUserStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (userAuth) => {
            if (userAuth) {
                setUser({ uid: userAuth.uid, email: userAuth.email });
            } else {
                clearUser();
            }
            setLoading(false);
        });
        return () => unsubscribe();
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