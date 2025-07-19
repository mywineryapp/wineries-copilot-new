const xlsx = require('xlsx');
const fs = require('fs');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// 🔧 Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyC3pBlEgcfPrOd24jIKo14O3nKfFBQ-gMc',
  authDomain: 'mywineryapppersonal.firebaseapp.com',
  projectId: 'mywineryapppersonal',
  storageBucket: 'mywineryapppersonal.firebasestorage.app',
  messagingSenderId: '922833324117',
  appId: '1:922833324117:web:9ca631c7c8a38ed1bcacdc'
};

// 🔌 Firebase init
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 📖 Load Excel
const workbook = xlsx.readFile('ΕΠΑΦΕΣ ΣΠΥΡΟΣ χωρις επωνυμια.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet, { defval: '' });

const skippedContacts = [];

async function importContacts() {
  for (const [index, row] of data.entries()) {
    const wineryId = row['Κωδικός']?.toString().trim();
    const firstName = row['Όνομα']?.toString().trim();
    const lastName = row['Επώνυμο']?.toString().trim();
    const fullName = `${firstName} ${lastName}`.trim();

    // ❌ Παραλείπεται μόνο αν λείπει ο Κωδικός ή και τα δύο: Όνομα & Επώνυμο
    if (!wineryId || (!firstName && !lastName)) {
      const skipped = {
        rowIndex: index + 2,
        wineryId,
        name: fullName,
        raw: row
      };
      skippedContacts.push(skipped);
      console.warn(`⚠️ Παραλείπεται επαφή στη γραμμή ${skipped.rowIndex}:`, skipped);
      continue;
    }

    const contact = {
  wineryId,
  role: row['Ιδιότητα']?.toString().trim() || null,
  name: fullName,
  phones: [
    { value: row['Τηλέφωνο 1']?.toString().replace(/\s+/g, ''), type: 'σταθερό' },
    { value: row['Τηλέφωνο 2']?.toString().replace(/\s+/g, ''), type: 'σταθερό' },
    { value: row['Κινητό']?.toString().replace(/\s+/g, ''), type: 'κινητό' },
    { value: row['Κιν2']?.toString().replace(/\s+/g, ''), type: 'κινητό' }
  ].filter(p => p.value),

  emails: [
    { value: row['EMAIL1']?.toString().trim(), type: 'εργασίας' },
    { value: row['EMAIL2']?.toString().trim(), type: 'προσωπικό' }
  ].filter(e => e.value)
};
    try {
      await addDoc(collection(db, 'contacts'), contact);
      console.log(`✅ Προστέθηκε: ${contact.name} (Winery ID: ${contact.wineryId})`);
    } catch (err) {
      console.error(`❌ Σφάλμα στη γραμμή ${index + 2}:`, err);
    }
  }

  if (skippedContacts.length > 0) {
    fs.writeFileSync('skippedContacts.json', JSON.stringify(skippedContacts, null, 2), 'utf-8');
    console.log(`📄 Αποθηκεύτηκαν ${skippedContacts.length} παραλείψεις στο skippedContacts.json`);
  }

  console.log('🎉 Η εισαγωγή επαφών ολοκληρώθηκε!');
}

importContacts();