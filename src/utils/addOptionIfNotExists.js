import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const addOptionIfNotExists = async (path, value) => {
  const snapshot = await getDocs(collection(db, path));
  const exists = snapshot.docs.some(doc => doc.data().name === value);
  if (!exists) {
    await addDoc(collection(db, path), { name: value });
  }
};