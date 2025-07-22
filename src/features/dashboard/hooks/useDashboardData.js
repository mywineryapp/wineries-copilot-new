import { useState, useEffect } from 'react';
import { collection, query, orderBy, where, getCountFromServer, getDocs, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../../services/firestore';

const MY_WINERY_ID = "ΠΑ-0087";

export const useDashboardData = () => {
    const [stats, setStats] = useState({ wineries: 0, openCases: 0, salesThisYear: 0, salesByYear: {} });
    const [wineries, setWineries] = useState([]);
    const [latestReminders, setLatestReminders] = useState([]);
    const [paymentComms, setPaymentComms] = useState([]);
    const [untouchedWineries, setUntouchedWineries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // --- Queries που τρέχουν μία φορά ---
                const currentYear = new Date().getFullYear();
                const wineriesQuery = query(collection(db, 'wineries'), orderBy('name'));
                const casesQuery = query(collection(db, 'communications'), where('isClosed', '==', false));
                const mySalesQuery = query(collection(db, 'sales_by_year'), where('wineryId', '==', MY_WINERY_ID));
                
                // ✅✅✅ ΔΙΟΡΘΩΣΗ: Φέρνουμε ΟΛΕΣ τις επικοινωνίες ΜΙΑ ΦΟΡΑ εδώ ✅✅✅
                const allCommsQuery = query(collection(db, 'communications'));

                const [wineriesSnap, casesSnap, mySalesSnap, allCommsSnap] = await Promise.all([
                    getDocs(wineriesQuery),
                    getCountFromServer(casesQuery),
                    getDocs(mySalesQuery),
                    getDocs(allCommsQuery), // Εκτελούμε το query
                ]);

                const allWineriesData = wineriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), label: doc.data().name }));
                setWineries(allWineriesData);

                const salesByYearData = {};
                mySalesSnap.docs.forEach(doc => {
                    const { year, value } = doc.data();
                    salesByYearData[year] = (salesByYearData[year] || 0) + (value || 0);
                });

                setStats({
                    wineries: wineriesSnap.size,
                    openCases: casesSnap.data().count,
                    salesThisYear: salesByYearData[currentYear] || 0,
                    salesByYear: salesByYearData,
                });
                
                // ✅✅✅ Η λογική για τα "ξεχασμένα" οινοποιεία εκτελείται ΜΙΑ ΦΟΡΑ εδώ ✅✅✅
                const allCommsData = allCommsSnap.docs.map(doc => doc.data());
                processUntouchedWineries(allWineriesData, allCommsData);

            } catch (err) {
                console.error("Error fetching initial dashboard data:", err);
                setError("Σφάλμα κατά τη φόρτωση των βασικών δεδομένων.");
            } finally {
                setLoading(false);
            }
        };

        const processUntouchedWineries = (allWineries, allComms) => {
            const twoMonthsAgo = new Date();
            twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

            const lastContactMap = new Map();
            allComms.forEach(comm => {
                const contactDate = comm.contactDate?.toDate();
                if (contactDate && comm.wineryId) {
                    const existing = lastContactMap.get(comm.wineryId);
                    if (!existing || contactDate > existing) {
                        lastContactMap.set(comm.wineryId, contactDate);
                    }
                }
            });

            const untouched = allWineries
                .filter(w => !w.excludeFromReminders)
                .map(winery => ({
                    ...winery,
                    lastContact: lastContactMap.get(winery.id) || new Date(0)
                }))
                .filter(winery => winery.lastContact < twoMonthsAgo)
                .sort((a, b) => a.lastContact - b.lastContact);
            
            setUntouchedWineries(untouched.slice(0, 4));
        };
        
        fetchData();

        // --- Listeners για δεδομένα που αλλάζουν συχνά ---
        const today = new Date();
        const remindersQuery = query(collection(db, 'communications'), where('isClosed', '==', false), where('reminderDate', '>=', today), orderBy('reminderDate', 'asc'), limit(3));
        const paymentCommsQuery = query(collection(db, 'communications'), where('purposeName', '==', 'Πληρωμή'), orderBy('contactDate', 'desc'), limit(5));

        const unsubReminders = onSnapshot(remindersQuery, (snapshot) => {
            setLatestReminders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const unsubPayments = onSnapshot(paymentCommsQuery, (snapshot) => {
            setPaymentComms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => { // Cleanup
            unsubReminders();
            unsubPayments();
        };

    }, []);

    return { stats, wineries, latestReminders, paymentComms, untouchedWineries, loading, error };
};