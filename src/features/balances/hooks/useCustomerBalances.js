import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../../services/firestore';

export const useCustomerBalances = () => {
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const q = query(collection(db, 'customer_balances'), orderBy('customerName', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedBalances = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setBalances(fetchedBalances);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching balance report:", err);
            setError("Σφάλμα ανάκτησης δεδομένων υπολοίπων.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { balances, loading, error };
};