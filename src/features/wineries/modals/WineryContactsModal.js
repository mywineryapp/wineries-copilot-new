import React, { useState, useEffect } from 'react';
import {
  Box, Tabs, Tab, DialogContent, Dialog, DialogTitle, Button, Stack
} from '@mui/material';
import { styled } from '@mui/system';
import { collection, query, where, onSnapshot } from 'firebase/firestore'; 
import AddIcon from '@mui/icons-material/Add';

import { CancelTopRightButton } from '../../../components/buttons';
import WineryOverviewSection from '../sections/WineryOverviewSection';
import WineryProductionSection from '../sections/WineryProductionSection';
import WineryProductsSection from '../sections/WineryProductsSection';
import WineryOrdersSection from '../sections/WineryOrdersSection';
import WineryBalanceSection from '../sections/WineryBalanceSection';
import WineryResponsiblesSection from '../sections/WineryResponsiblesSection';
import CommunicationListPage from '../../communications/CommunicationListPage';

import ContactsEditModal from './ContactsEditModal';
import OrderEditModal from './OrderEditModal';
import { useModal } from '../../../context/ModalContext';

const StyledTab = styled(Tab)(({ theme }) => ({ 
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '1rem',
    minWidth: 120,
    '&.Mui-selected': { color: '#a52a2a', },
    '&.MuiTab-textColorPrimary': { color: 'rgba(0, 0, 0, 0.7)', },
}));

export default function WineryContactsModal({ winery, setEditMode, open, onClose, db }) {
  const { showModal } = useModal();
  const [selectedTab, setSelectedTab] = useState(0);
  const [balanceData, setBalanceData] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  
  // States for modals inside this component
  const [editContactModalOpen, setEditContactModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (open && winery?.id) {
        setBalanceLoading(true);
        const q = query(collection(db, 'customer_balances'), where('customerId', '==', winery.id));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                setBalanceData(snapshot.docs[0].data());
            } else { setBalanceData(null); }
            setBalanceLoading(false);
        }, (error) => {
            console.error("Error fetching balance data for winery:", error);
            setBalanceLoading(false);
        });
        return () => unsubscribe();
    }
  }, [open, winery?.id, db]);
  
  const handleTabChange = (event, newValue) => setSelectedTab(newValue);

  // --- Handlers for modals ---
  const handleOpenContactModal = (contact = null) => {
      setSelectedContact(contact);
      setEditContactModalOpen(true);
  };
  const handleCloseContactModal = () => setEditContactModalOpen(false);
  
  const handleOpenOrderModal = (order = null) => {
      setSelectedOrder(order);
      setOrderModalOpen(true);
  };
  const handleCloseOrderModal = () => setOrderModalOpen(false);

  const handleNewCommunication = () => {
    showModal('COMMUNICATION_EDIT', { wineryId: winery.id, wineryName: winery.name });
  };
  
  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper" PaperProps={{ sx: { backgroundColor: 'white !important', borderRadius: 2, height: '90vh', maxHeight: '90vh', display: 'flex', flexDirection: 'column' } }} >
        <DialogTitle sx={{ backgroundColor: 'white !important', pb: 1, pt: 2, px: 3, position: 'relative' }}>
          Καρτέλα Οινοποιείου
          <CancelTopRightButton onClick={onClose} />
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: 'white !important', p: { xs: 2, sm: 3 }, overflowY: 'auto', flexGrow: 1 }}>
          <WineryOverviewSection winery={winery} db={db} setEditMode={setEditMode} />
          <Box sx={{ my: 3 }} />

          {/* ✅✅✅ ΕΠΑΝΑΦΕΡΑΜΕ ΟΛΕΣ ΤΙΣ ΚΑΡΤΕΛΕΣ ✅✅✅ */}
          <Tabs value={selectedTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" indicatorColor="primary" sx={{ '.MuiTabs-indicator': { backgroundColor: '#a52a2a' }, mb: 2 }} >
            <StyledTab label="👥 Υπεύθυνοι" />
            <StyledTab label="💬 Επικοινωνίες" />
            <StyledTab label="📊 Πωλήσεις CorkHellas" />
            <StyledTab label="🍾 Προϊόντα / Ετικέτες" />
            <StyledTab label="📦 Παραγγελίες Οινοποιείου" />
            <StyledTab label="💰 Υπόλοιπα" />
          </Tabs>
          
          {selectedTab === 0 && <WineryResponsiblesSection winery={winery} db={db} onContactClick={handleOpenContactModal} />}
          {selectedTab === 1 && (
              <Box>
                  <Button variant="outlined" startIcon={<AddIcon />} onClick={handleNewCommunication} sx={{mb: 2}}>
                      Προσθήκη Νέας Επικοινωνίας
                  </Button>
                  <CommunicationListPage wineryFilter={winery} />
              </Box>
          )}
          {selectedTab === 2 && <WineryProductionSection winery={winery} db={db} open={selectedTab === 2} />}
          {selectedTab === 3 && <WineryProductsSection winery={winery} />}
          {selectedTab === 4 && <WineryOrdersSection winery={winery} onOpenOrderModal={handleOpenOrderModal} />}
          {selectedTab === 5 && <WineryBalanceSection balanceData={balanceData} loading={balanceLoading} />}
          
        </DialogContent>
      </Dialog>
      
      {/* Modals που διαχειρίζεται αυτό το component */}
      {editContactModalOpen && <ContactsEditModal open={editContactModalOpen} onClose={handleCloseContactModal} contact={selectedContact} winery={winery} db={db} onSaveSuccess={handleCloseContactModal}/>}
      {orderModalOpen && <OrderEditModal open={orderModalOpen} onClose={handleCloseOrderModal} order={selectedOrder} wineryId={winery?.id} wineryName={winery?.name} onSaveSuccess={handleCloseOrderModal} />}
    </>
  );
}