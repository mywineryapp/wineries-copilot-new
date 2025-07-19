const xlsx = require('xlsx');
const { initializeApp } = require('firebase/app');
const { getFirestore, setDoc, doc } = require('firebase/firestore');

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

// ✨ Συλλογή μοναδικών προϊόντων βάσει κωδικού
const productMap = new Map();

data.forEach(row => {
  let raw = row['ΕΙΔΟΣ']?.toString().trim();
  if (!raw || raw.includes('ΣΥΝΟΛΟ')) return;

  // 👉 Εντοπισμός μοναδικού κωδικού (π.χ. ΦΚ-0108)
  const match = raw.match(/^([A-ZΑ-Ω]{2}-\d{4})\s+(.*)$/i);
  if (!match) return;

  const code = match[1].toUpperCase();
  const pureName = match[2].trim();

  // ❌ Εξαιρέσεις
  if (code.startsWith('ΧΚ-') || code.startsWith('ΣΦ-')) return;

  if (!productMap.has(code)) {
    productMap.set(code, pureName);
  }
});

console.log(`🔍 Συνολικά μοναδικά προϊόντα προς εισαγωγή: ${productMap.size}`);

async function uploadToClosureTypes() {
  for (const [code, name] of productMap) {
    const docId = code.replace(/\s+/g, '_').toLowerCase();

    const docData = {
      code,            // π.χ. ΦΚ-0108
      name,            // π.χ. ΚΕΦ.ΠΛΑΣΤ. Φ.19,5 TOP 29,5 X 12 SC
      active: true,    // ✅ ενεργό
      sortOrder: 999,  // 🔢 default σειρά (αλλάξ’ το μετά στο UI σου)
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'closureTypes', docId), docData);
      console.log(`✅ Προστέθηκε: ${code} (${name})`);
    } catch (err) {
      console.error(`❌ Σφάλμα στο: ${code}`, err);
    }
  }

  console.log('🎉 Ολοκληρώθηκε η εισαγωγή closure types!');
}

uploadToClosureTypes();
