const xlsx = require('xlsx');
const fs = require('fs');

// 📥 Διαβάζουμε το αρχείο
const workbook = xlsx.readFile('ΠΕΛΑΤΕΣ ΣΠΥΡΟΣ ΕΙΔΗ ΑΝΑ ΕΤΟΣ (1).xlsm');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rawData = xlsx.utils.sheet_to_json(sheet, { defval: null });

// 🧠 Fill down στη στήλη ΚΩΔΠΕΛ
let lastWineryId = null;
const filledData = rawData.map(row => {
  const currentId = row["ΚΩΔΠΕΛ"]?.toString().trim();
  if (currentId) lastWineryId = currentId;

  return {
    ...row,
    "ΚΩΔΠΕΛ": lastWineryId
  };
});

// 📤 Δημιουργία νέου Excel αρχείου
const newSheet = xlsx.utils.json_to_sheet(filledData);
const newWorkbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(newWorkbook, newSheet, 'Φύλλο1');

// 💾 Αποθήκευση νέου αρχείου
xlsx.writeFile(newWorkbook, 'ΠΕΛΑΤΕΣ_ΣΠΥΡΟΣ_ΣΥΜΠΛΗΡΩΜΕΝΟ.xlsx');

console.log('✅ Το νέο αρχείο δημιουργήθηκε: ΠΕΛΑΤΕΣ_ΣΠΥΡΟΣ_ΣΥΜΠΛΗΡΩΜΕΝΟ.xlsx');