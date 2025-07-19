const xlsx = require('xlsx');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, where } = require('firebase/firestore');

// 🔧 Firebase config – Βάλε εδώ τα δικά σου στοιχεία!
const firebaseConfig = {
  apiKey: 'AIzaSyC3pBlEgcfPrOd24jIKo14O3nKfFBQ-gMc',
  authDomain: 'mywineryapppersonal.firebaseapp.com',
  projectId: 'mywineryapppersonal',
  storageBucket: 'mywineryapppersonal.firebasestorage.app',
  messagingSenderId: '922833324117',
  appId: '1:922833324117:web:9ca631c7c8a38ed1bcacdc'
};

// 🔌 Αρχικοποίηση Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 📥 Διαβάζουμε το Excel
const workbook = xlsx.readFile('κρητη ετικετες.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet);

// 🚀 Εισαγωγή στο Firestore με έλεγχο διπλοεγγραφών
async function importProducts() {
  for (const row of data) {
    try {
      const name = row["Ετικέτα"]?.trim() || "Χωρίς Όνομα";
      const wineryId = row["Κωδικός"]?.toString().trim() || null;

      if (!wineryId) {
        console.warn(`⚠️ Το προϊόν "${name}" δεν έχει wineryId. Παραλείπεται.`);
        continue;
      }

      // 🔍 Έλεγχος αν υπάρχει ήδη με ίδιο name + wineryId
      const q = query(
        collection(db, 'wines'),
        where('name', '==', name),
        where('wineryId', '==', wineryId)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        console.log(`⏩ Ήδη υπάρχει: ${name} (Winery ID: ${wineryId}) – Παράκαμψη`);
        continue;
      }

      const product = {
        name,
        variety: row["Είδος"] ? [row["Είδος"].trim()] : [],
        color: row["Χρώμα"] || null,
        wineryId,
        labelImageURL: null // Εδώ μπορεί να προστεθεί αργότερα
      };

      await addDoc(collection(db, 'wines'), product);
      console.log(`✅ Προστέθηκε: ${product.name} (Winery ID: ${product.wineryId})`);

    } catch (err) {
      console.error(`❌ Σφάλμα στην εισαγωγή προϊόντος "${row["Ετικέτα"]}":`, err);
    }
  }

  console.log('🎉 Η εισαγωγή ολοκληρώθηκε χωρίς διπλοεγγραφές.');
}

importProducts();
