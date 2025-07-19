const xlsx = require('xlsx');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

// 🔧 Firebase config
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

// 📥 Load Excel
const workbook = xlsx.readFile('gia eisagogi.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet, { defval: '' });

// ✨ Helper για καθαρισμό ονομάτων στηλών
function getCleanValue(row, prefix, year) {
  const targetKey = `${prefix}${year}`.replace(/\s+/g, '').toUpperCase();
  const key = Object.keys(row).find(
    k => k.replace(/\s+/g, '').toUpperCase() === targetKey
  );
  if (!key) return 0;
  const val = row[key];
  return parseFloat(val?.toString().replace(',', '.')) || 0;
}

// 🛠 Συμπλήρωσε τα κενά wineryId από πάνω (forward fill)
let lastWineryId = '';
const salesRows = data.filter((row, i) => {
  if (row['ΚΩΔΠΕΛ']) {
    lastWineryId = row['ΚΩΔΠΕΛ'].toString().trim();
  } else {
    row['ΚΩΔΠΕΛ'] = lastWineryId;
  }
  return row['ΕΙΔΟΣ'] && !row['ΕΙΔΟΣ'].toString().includes('ΣΥΝΟΛΟ');
});

// 🧠 Εισαγωγή στο Firestore με custom doc ID
async function importSalesByYear() {
  let count = 0;

  for (const row of salesRows) {
    const wineryId = row['ΚΩΔΠΕΛ'];
    const product = row['ΕΙΔΟΣ'].toString().trim();

    for (let year = 2017; year <= 2025; year++) {
      const value = getCleanValue(row, 'ΑΞΙΑ', year);
      const quantity = getCleanValue(row, 'ΠΟΣΟΤΗΤΑ', year);

      if (value === 0 && quantity === 0) {
        continue;
      }

      const docData = {
        wineryId,
        product,
        year,
        value,
        quantity
      };

      // 🔑 Μοναδικό ID: wineryId_product_year (χωρίς κενά, πεζά/κεφαλαία ανεξάρτητα)
      const cleanProduct = product.replace(/\s+/g, '_').toLowerCase();
      const docId = `${wineryId}_${cleanProduct}_${year}`;

      try {
        await setDoc(doc(collection(db, 'sales_by_year'), docId), docData);
        console.log(`✅ Set ${product} (${year}) for ${wineryId}`);
        count++;
      } catch (err) {
        console.error(`❌ Error for ${wineryId} (${year})`, err);
      }
    }
  }

  console.log(`🎉 Ολοκληρώθηκε. Συνολικά ${count} εγγραφές αποθηκεύτηκαν/ενημερώθηκαν.`);
}

importSalesByYear();
