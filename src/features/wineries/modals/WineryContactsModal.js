import React, { useState, useEffect } from 'react';
import {
  Box, Tabs, Tab, DialogContent, Dialog, DialogTitle, Button, Stack
} from '@mui/material';
import { styled } from '@mui/system';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import AddIcon from '@mui/icons-material/Add';

import { CancelTopRightButton } from '../../../components/buttons';
import WineryOverviewSection from '../sections/WineryOverviewSection';
import WineryProductionSection from '../sections/WineryProductionSection';
import WineryProductsSection from '../sections/WineryProductsSection';
import WineryOrdersSection from '../sections/WineryOrdersSection';
import WineryBalanceSection from '../sections/WineryBalanceSection';
import WineryResponsiblesSection from '../sections/WineryResponsiblesSection';
import CommunicationListPage from '../../communications/CommunicationListPage';
import InvoicesListPage from '../../invoices/InvoicesListPage';

import ContactsEditModal from './ContactsEditModal';
import OrderEditModal from './OrderEditModal';
import CommunicationEditModal from '../../communications/CommunicationEditModal';
// ✅ ΝΕΟ IMPORT
import InvoiceDetailsModal from '../../invoices/InvoiceDetailsModal';

const StyledTab = styled(Tab)(({ theme }) => ({ 
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '1rem',
    minWidth: 120,
    '&.Mui-selected': { color: '#a52a2a', },
    '&.MuiTab-textColorPrimary': { color: 'rgba(0, 0, 0, 0.7)', },
}));

export default function WineryContactsModal({ winery, setEditMode, open, onClose, db }) {
  const [selectedTab, setSelectedTab] = useState(0);
  
  // States για τα modals
  const [editContactModalOpen, setEditContactModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [commEditModalOpen, setCommEditModalOpen] = useState(false);
  const [selectedCommunication, setSelectedCommunication] = useState(null);
  // ✅ ΝΕΑ STATE ΓΙΑ ΤΟ MODAL ΤΙΜΟΛΟΓΙΩΝ
  const [invoiceDetailsOpen, setInvoiceDetailsOpen] = useState(false);
  const [selectedInvoiceGroup, setSelectedInvoiceGroup] = useState(null);

  // States για τα δεδομένα
  const [balanceData, setBalanceData] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [salesLoading, setSalesLoading] = useState(true);

  useEffect(() => {
    if (open && winery?.id) {
        setBalanceLoading(true);
        const q = query(collection(db, 'customer_balances'), where('customerId', '==', winery.id));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) { setBalanceData(snapshot.docs[0].data()); } else { setBalanceData(null); }
            setBalanceLoading(false);
        });
        return () => unsubscribe();
    }
  }, [open, winery?.id, db]);

  useEffect(() => {
    const fetchSalesData = async () => {
        if (open && winery?.id) {
            setSalesLoading(true);
            try {
                const salesQuery = query(collection(db, 'sales_by_year'), where('wineryId', '==', winery.id));
                const snapshot = await getDocs(salesQuery);
                setSalesData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) { console.error("Error fetching sales data:", err); setSalesData([]); }
            finally { setSalesLoading(false); }
        }
    };
    fetchSalesData();
  }, [open, winery?.id, db]);
  
  const handleTabChange = (event, newValue) => setSelectedTab(newValue);

  // Handlers για τα modals
  const handleOpenContactModal = (contact = null) => { setSelectedContact(contact); setEditContactModalOpen(true); };
  const handleCloseContactModal = () => setEditContactModalOpen(false);
  const handleOpenOrderModal = (order = null) => { setSelectedOrder(order); setOrderModalOpen(true); };
  const handleCloseOrderModal = () => setOrderModalOpen(false);
  const handleOpenCommunicationModal = (communication = null) => { setSelectedCommunication(communication); setCommEditModalOpen(true); };
  const handleCloseCommunicationModal = () => { setCommEditModalOpen(false); setSelectedCommunication(null); };
  // ✅ ΝΕΕΣ ΣΥΝΑΡΤΗΣΕΙΣ ΓΙΑ ΤΟ LOCAL MODAL ΤΙΜΟΛΟΓΙΩΝ
  const handleOpenInvoiceDetails = (invoiceGroup) => {
    setSelectedInvoiceGroup(invoiceGroup);
    setInvoiceDetailsOpen(true);
  };
  const handleCloseInvoiceDetails = () => setInvoiceDetailsOpen(false);


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

          <Tabs value={selectedTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" indicatorColor="primary" sx={{ '.MuiTabs-indicator': { backgroundColor: '#a52a2a' }, mb: 2 }} >
            <StyledTab label="👥 Υπεύθυνοι" />
            <StyledTab label="💬 Επικοινωνίες" />
            <StyledTab label="📊 Πωλήσεις CorkHellas" />
            <StyledTab label="🍾 Προϊόντα / Ετικέτες" />
            <StyledTab label="📦 Παραγγελίες Οινοποιείου" />
            <StyledTab label="💰 Υπόλοιπα" />
            {/* ✅✅✅ ΑΛΛΑΓΗ ΕΤΙΚΕΤΑΣ ΕΔΩ ✅✅✅ */}
            <StyledTab label="🧾 Τιμολόγια" />
          </Tabs>
          
          {selectedTab === 0 && <WineryResponsiblesSection winery={winery} db={db} onContactClick={handleOpenContactModal} />}
          {selectedTab === 1 && (
              <Box>
                  <Button variant="outlined" startIcon={<AddIcon />} onClick={() => handleOpenCommunicationModal(null)} sx={{mb: 2}}>
                      Προσθήκη Νέας Επικοινωνίας
                  </Button>
                  <CommunicationListPage wineryFilter={winery} onAddItem={() => handleOpenCommunicationModal(null)} onEditItem={(item) => handleOpenCommunicationModal(item)} />
              </Box>
          )}
          {selectedTab === 2 && <WineryProductionSection winery={winery} db={db} allSalesData={salesData} loading={salesLoading} />}
          {selectedTab === 3 && <WineryProductsSection winery={winery} />}
          {selectedTab === 4 && <WineryOrdersSection winery={winery} onOpenOrderModal={handleOpenOrderModal} />}
          {selectedTab === 5 && <WineryBalanceSection balanceData={balanceData} loading={balanceLoading} />}
          {/* ✅✅✅ ΠΕΡΝΑΜΕ ΤΗ ΝΕΑ ΣΥΝΑΡΤΗΣΗ ΩΣ PROP ✅✅✅ */}
          {selectedTab === 6 && (<InvoicesListPage wineryId={winery.id} onRowClick={handleOpenInvoiceDetails} />)}
          
        </DialogContent>
      </Dialog>
      
      {/* Modals που διαχειρίζεται αυτό το component */}
      {editContactModalOpen && <ContactsEditModal open={editContactModalOpen} onClose={handleCloseContactModal} contact={selectedContact} winery={winery} db={db} onSaveSuccess={handleCloseContactModal}/>}
      {orderModalOpen && <OrderEditModal open={orderModalOpen} onClose={handleCloseOrderModal} order={selectedOrder} wineryId={winery?.id} onSaveSuccess={handleCloseOrderModal} />}
      {commEditModalOpen && <CommunicationEditModal open={commEditModalOpen} onClose={handleCloseCommunicationModal} communication={selectedCommunication} wineryId={winery.id} wineryName={winery.name} />}
      {/* ✅ RENDER ΤΟΥ MODAL ΤΙΜΟΛΟΓΙΩΝ */}
      {invoiceDetailsOpen && <InvoiceDetailsModal open={invoiceDetailsOpen} onClose={handleCloseInvoiceDetails} invoiceGroup={selectedInvoiceGroup} />}
    </>
  );
}