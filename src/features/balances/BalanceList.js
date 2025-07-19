import BalanceCard from './BalanceCard';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { COLLECTIONS } from '../../config/collections';

export default function BalanceList({ onlyOverdue = false }) {
  const balances = useFirestoreCollection(COLLECTIONS.BALANCES);

  const filtered = onlyOverdue
    ? balances.filter(b => b.status === 'Καθυστερημένο')
    : balances;

  return (
    <div>
      {filtered.map(b => (
        <BalanceCard key={b.id} data={b} />
      ))}
    </div>
  );
}