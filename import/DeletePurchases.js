const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
} = require('firebase/firestore');

// 🔧 Firebase config (το δικό σου project)
const firebaseConfig = {
  apiKey: 'AIzaSyC3pBlEgcfPrOd24jIKo14O3nKfFBQ-gMc',
  authDomain: 'mywineryapppersonal.firebaseapp.com',
  projectId: 'mywineryapppersonal',
  storageBucket: 'mywineryapppersonal.firebasestorage.app',
  messagingSenderId: '922833324117',
  appId: '1:922833324117:web:9ca631c7c8a38ed1bcacdc'
};

// 🔌 Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteNestedPurchases() {
  const wineriesSnapshot = await getDocs(collection(db, 'wineries'));

  if (wineriesSnapshot.empty) {
    console.log('⚠️ Δεν βρέθηκαν οινοποιεία.');
    return;
  }

  for (const wineryDoc of wineriesSnapshot.docs) {
    const wineryId = wineryDoc.id;
    const purchasesRef = collection(db, 'wineries', wineryId, 'purchases');
    const purchasesSnapshot = await getDocs(purchasesRef);

    if (purchasesSnapshot.empty) {
      console.log(`ℹ️ Δεν υπάρχουν αγορές για οινοποιείο ${wineryId}`);
      continue;
    }

    for (const purchaseDoc of purchasesSnapshot.docs) {
      await deleteDoc(doc(db, 'wineries', wineryId, 'purchases', purchaseDoc.id));
      console.log(`🗑️ Διεγράφη αγορά: ${purchaseDoc.id} (winery: ${wineryId})`);
    }
  }

  console.log('✅ Ολοκληρώθηκε η διαγραφή όλων των nested purchases.');
}

deleteNestedPurchases();
