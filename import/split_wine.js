const XLSX = require('xlsx');

// 📥 Φόρτωσε το Excel αρχείο
const workbook = XLSX.readFile('Πωλήσεις Σπύρος.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// 🔄 Μετατροπή σε JSON
let data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

data = data.map((row) => {
  const gText = row['ΣτήληG'] || '';

  let bottle = '';
  let wine = '';

  if (
    typeof gText === 'string' &&
    gText !== '' &&
    !gText.toUpperCase().includes('ΔΩΡΟ') &&
    !gText.toUpperCase().includes('ΔΕΙΓΜΑΤΑ') &&
    (gText.toUpperCase().includes('ΟΙΝΟΣ') || gText.toUpperCase().includes('ΟΙΝΟΙ'))
  ) {
    const segments = gText.split('|').map(s => s.trim());

    bottle = segments.find(s => s.toUpperCase().includes('ΦΙΑΛΗ')) || '';
    wine = segments.find(s => s.toUpperCase().includes('ΟΙΝΟΣ') || s.toUpperCase().includes('ΟΙΝΟΙ')) || '';
  }

  return {
    ...row,
    'Φιάλη': bottle,
    'Οίνος': wine,
  };
});

// 📤 Δημιουργία νέου sheet
const newSheet = XLSX.utils.json_to_sheet(data);
const newWorkbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(newWorkbook, newSheet, 'Καθαρισμένα');

// 💾 Αποθήκευση σε νέο αρχείο
XLSX.writeFile(newWorkbook, 'Πωλήσεις_Επεξεργασμένα.xlsx');
console.log('✅ Έτοιμο το αρχείο Πωλήσεις_Επεξεργασμένα.xlsx');