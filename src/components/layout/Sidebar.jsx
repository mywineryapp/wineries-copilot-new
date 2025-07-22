import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Toolbar,
  Divider,
  Typography
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WineBarIcon from '@mui/icons-material/WineBar';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ForumIcon from '@mui/icons-material/Forum';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';

const drawerWidth = 260;

const menuItems = [
  { text: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { text: 'Ευρετήριο Οινοποιείων', path: '/wineries', icon: <WineBarIcon /> },
 
  { text: 'Αναζήτηση Τιμολογίων', path: '/invoices/search', icon: <SearchIcon /> },
  { text: 'Επικοινωνίες', path: '/communications', icon: <ForumIcon /> },
  { text: 'Παραγγελίες', path: '/orders', icon: <ShoppingCartIcon /> },
  { text: 'Υπόλοιπα', path: '/balances', icon: <AccountBalanceIcon /> },
  { text: 'Αυτοματισμοί', path: '/automations', icon: <AutoAwesomeIcon /> },
  { text: 'Καθαρισμός Δεδομένων', path: '/datacleaning', icon: <BuildCircleIcon /> },
  { text: 'Ρυθμίσεις', path: '/settings', icon: <SettingsIcon /> },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      variant="temporary"
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
    >
      <Box
        sx={{
          width: drawerWidth,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflowY: 'auto'
        }}
        role="presentation"
        onClick={onClose}
        onKeyDown={onClose}
      >
        <Toolbar sx={{ justifyContent: 'center' }}>
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
            My Winery App
          </Typography>
        </Toolbar>
        <Divider />

        <List>
          {menuItems.map(item => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
              >
                <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
