const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Firebase config (όπως το έχεις ήδη)
const firebaseConfig = {
  apiKey: 'AIzaSyC3pBlEgcfPrOd24jIKo14O3nKfFBQ-gMc',
  authDomain: 'mywineryapppersonal.firebaseapp.com',
  projectId: 'mywineryapppersonal',
  storageBucket: 'mywineryapppersonal.firebasestorage.app',
  messagingSenderId: '922833324117',
  appId: '1:922833324117:web:9ca631c7c8a38ed1bcacdc'
};

// Αρχικοποίηση Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteAllProducts() {
  const winesRef = collection(db, 'wines');
  const snapshot = await getDocs(winesRef);
  console.log(`Βρέθηκαν ${snapshot.size} προϊόντα συνολικά.`);

  for (const docSnap of snapshot.docs) {
    try {
      await deleteDoc(doc(db, 'wines', docSnap.id));
      console.log(`🗑️ Διαγράφηκε: ${docSnap.id}`);
    } catch (err) {
      console.error(`❌ Σφάλμα στη διαγραφή του ${docSnap.id}:`, err);
    }
  }

  console.log('✅ Ολοκληρώθηκε η διαγραφή όλων των προϊόντων.');
}

deleteAllProducts();
