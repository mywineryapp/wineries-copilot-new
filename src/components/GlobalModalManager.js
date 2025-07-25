import React from 'react';
import { useModal } from '../context/ModalContext';

import WineryModalWrapper from '../features/wineries/modals/WineryModalWrapper';
import BalanceUploadModal from '../features/balances/BalanceUploadModal';
import CommunicationEditModal from '../features/communications/CommunicationEditModal';
import SalesUploadModal from '../features/imports/SalesUploadModal'; 
import InvoiceDetailsModal from '../features/invoices/InvoiceDetailsModal';
import OrderModalWrapper from '../features/orders/OrderModalWrapper'; // ✅ ΝΕΟ IMPORT

const MODAL_COMPONENTS = {
    'WINERY_PROFILE': WineryModalWrapper,
    'BALANCE_UPLOAD': BalanceUploadModal,
    'COMMUNICATION_EDIT': CommunicationEditModal,
    'SALES_UPLOAD': SalesUploadModal,
    'INVOICE_DETAILS': InvoiceDetailsModal,
    'ORDER_EDIT': OrderModalWrapper, // ✅ ΝΕΑ ΕΓΓΡΑΦΗ
};

const GlobalModalManager = () => {
    const { modalType, modalProps, hideModal } = useModal();

    if (!modalType) {
        return null;
    }

    const SpecificModal = MODAL_COMPONENTS[modalType];

    if (!SpecificModal) {
        console.warn(`Modal type "${modalType}" is not registered.`);
        return null;
    }

    return <SpecificModal {...modalProps} open={true} onClose={hideModal} />;
};

export default GlobalModalManager;