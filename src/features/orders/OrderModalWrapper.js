import OrderEditModal from '../wineries/modals/OrderEditModal';
import { getFunctions } from 'firebase/functions';
import { getFirestore } from 'firebase/firestore';
import { useUserStore } from '../../store/userStore'; // Προσαρμόστε το αν έχεις διαφορετικό store

export default function OrderModalWrapper({
  order,
  open,
  onClose,
  customerId,
  customerName,
  onSaveSuccess // <--- Πρόσθεσε αυτό εδώ
}) {
  const db = getFirestore();
  const functions = getFunctions();
  const userId = useUserStore.getState().user?.uid || '';

  return (
    <OrderEditModal
      open={open}
      onClose={onClose}
      order={order}
      customerId={customerId}
      customerName={customerName}
      userId={userId}
      db={db}
      functions={functions}
      onSaveSuccess={onSaveSuccess} // <--- Και πέρνα το αυτό εδώ
    />
  );
}