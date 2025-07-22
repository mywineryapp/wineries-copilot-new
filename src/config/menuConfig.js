// src/config/menuConfig.js

import DashboardIcon from '@mui/icons-material/Dashboard';
import WineBarIcon from '@mui/icons-material/WineBar';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ForumIcon from '@mui/icons-material/Forum';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';

export const menuItems = [
  { text: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { text: 'Ευρετήριο Οινοποιείων', path: '/wineries', icon: <WineBarIcon /> },
  { text: 'Λίστα Τιμολογίων', path: '/invoices', icon: <ReceiptLongIcon /> },
  { text: 'Επικοινωνίες', path: '/communications', icon: <ForumIcon /> },
  { text: 'Παραγγελίες', path: '/orders', icon: <ShoppingCartIcon /> },
  { text: 'Υπόλοιπα', path: '/balances', icon: <AccountBalanceIcon /> },
  { text: 'Αναζήτηση Τιμολογίων', path: '/invoices/search', icon: <SearchIcon /> },
  { text: 'Αυτοματισμοί', path: '/automations', icon: <AutoAwesomeIcon /> },
  { text: 'Καθαρισμός Δεδομένων', path: '/datacleaning', icon: <BuildCircleIcon /> },
  { text: 'Ρυθμίσεις', path: '/settings', icon: <SettingsIcon /> },
];
