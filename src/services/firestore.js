// src/services/firestore.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
// ✅ ΝΕΟ IMPORT: Εισάγουμε την υπηρεσία Αυθεντικοποίησης
import { getAuth } from "firebase/auth";

// Η Firebase Config σου
const firebaseConfig = {
  apiKey: 'AIzaSyC3pBlEgcfPrOd24jIKo14O3nKfFBQ-gMc',
  authDomain: 'mywineryapppersonal.firebaseapp.com',
  projectId: 'mywineryapppersonal',
  storageBucket: 'mywineryapppersonal.firebasestorage.app',
  messagingSenderId: '922833324117',
  appId: '1:922833324117:web:9ca631c7c8a38ed1bcacdc'
};

// Αρχικοποίηση της Firebase εφαρμογής
const app = initializeApp(firebaseConfig);

// Εξαγωγή ΟΛΩΝ των υπηρεσιών από εδώ
export const db = getFirestore(app);
export const functions = getFunctions(app,'europe-west1');
export const storage = getStorage(app);
// ✅ ΝΕΑ ΕΞΑΓΩΓΗ: Εξάγουμε το Firebase Auth instance
export const auth = getAuth(app);

/**
 * Συνάρτηση για την ανάκτηση όλων των εγγράφων από μια συγκεκριμένη συλλογή του Firestore.
 * @param {string} collectionName - Το όνομα της συλλογής από την οποία θα ανακτηθούν τα δεδομένα.
 * @returns {Promise<firebase.firestore.QuerySnapshot>} Ένα Promise που επιλύεται σε ένα QuerySnapshot
 * που περιέχει τα έγγραφα της συλλογής.
 * @throws {Error} Εάν το collectionName είναι κενό ή undefined.
 */
export const getCollection = async (collectionName) => {
  if (!collectionName || typeof collectionName !== 'string' || collectionName.trim() === '') {
    console.error("Σφάλμα: Το όνομα της συλλογής δεν μπορεί να είναι κενό ή μη καθορισμένο.");
    throw new Error("Collection name cannot be empty or undefined.");
  }
  try {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    return querySnapshot;
  } catch (error) {
    console.error(`Σφάλμα ανάκτησης συλλογής '${collectionName}':`, error);
    throw error;
  }
};