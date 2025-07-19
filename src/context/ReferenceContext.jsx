import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firestore';

const ReferenceContext = createContext();

export const useReferences = () => useContext(ReferenceContext);

// ✅✅✅ Αφαιρέσαμε τις περιττές λίστες από εδώ ✅✅✅
const referencePaths = [
  'closureTypes',
  'bottleTypes',
  'bottleCompanies',
  'wines',
  'salespeople',
  'communicationPurposes',
  'communicationMethods',
];

export const ReferenceProvider = ({ children }) => {
  const [references, setReferences] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribes = referencePaths.map((path) => {
      const q = query(collection(db, path), orderBy('name'));
      return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name
        }));
        setReferences((prev) => ({ ...prev, [path]: items }));
      });
    });

    setLoading(false);
    return () => unsubscribes.forEach((unsub) => unsub());
  }, []);

  return (
    <ReferenceContext.Provider value={{ ...references, loading }}>
      {children}
    </ReferenceContext.Provider>
  );
};