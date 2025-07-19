import { useEffect, useState } from 'react';
import { listenCollection } from '../services/firestore';

export const useFirestoreCollection = (path) => {
  const [data, setData] = useState([]);
  useEffect(() => {
    const unsubscribe = listenCollection(path, setData);
    return () => unsubscribe();
  }, [path]);

  return data;
};