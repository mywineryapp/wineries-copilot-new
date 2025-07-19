const functions = require("firebase-functions");
const admin = require("firebase-admin");
const xlsx = require("xlsx"); // Χρησιμοποιεί τη βιβλιοθήκη για Excel

// Βοηθητική συνάρτηση για να "καθαρίζει" και να μετατρέπει τις τιμές σε αριθμούς
const cleanAndParseNumber = (val) => {
    if (val === null || val === undefined || val === '') return 0;
    let stringValue = String(val).replace(/€/g, '').trim().replace(/\./g, '').replace(',', '.');
    const number = parseFloat(stringValue);
    return isNaN(number) ? 0 : number;
};

exports.processBalanceFile = functions.region('europe-west1').runWith({timeoutSeconds: 300, memory: '1GB'}).storage.object().onFinalize(async (object) => {
    const { bucket, name: filePath, contentType } = object;

    // Εκτελείται μόνο για αρχεία που ανεβαίνουν στον φάκελο 'balance-uploads/'
    if (!filePath.startsWith('balance-uploads/')) {
        functions.logger.log("Το αρχείο δεν είναι στον φάκελο balance-uploads. Αγνοείται.");
        return null;
    }

    const storageBucket = admin.storage().bucket(bucket);
    const db = admin.firestore();
    const batch = db.batch();
    let recordsProcessed = 0;

    functions.logger.log(`Ξεκινά η επεξεργασία του αρχείου υπολοίπων: ${filePath}`);

    try {
        const fileBuffer = (await storageBucket.file(filePath).download())[0];
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        const headers = data[0].map(h => h ? h.trim() : '');

        for (let i = 1; i < data.length; i++) {
            const rowArray = data[i];
            const rowData = {};
            headers.forEach((header, index) => {
                rowData[header] = rowArray[index];
            });

            const customerId = rowData['Κωδικός']?.trim();
            if (!customerId) continue; // Αν δεν υπάρχει κωδικός, προχωράμε στην επόμενη γραμμή

            const docRef = db.collection("customer_balances").doc(customerId);
            
            const balanceData = {
                customerId: customerId,
                customerName: rowData['Επωνυμία']?.trim(),
                totalBalance: cleanAndParseNumber(rowData['Υπόλοιπο']),
                days_0_30:    cleanAndParseNumber(rowData['0-30']),
                days_31_60:   cleanAndParseNumber(rowData['31-60']),
                days_61_90:   cleanAndParseNumber(rowData['61-90']),
                days_91_120:  cleanAndParseNumber(rowData['91-120']),
                days_121_150: cleanAndParseNumber(rowData['121-150']),
                days_151_plus:  cleanAndParseNumber(rowData['151+']),
                balanceLastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            };
            
            batch.set(docRef, balanceData, { merge: true });
            recordsProcessed++;
        }

        if (recordsProcessed > 0) {
            await batch.commit();
            functions.logger.log(`Επιτυχής ενημέρωση ${recordsProcessed} εγγραφών υπολοίπων.`);
            return { message: `Επιτυχής ενημέρωση ${recordsProcessed} εγγραφών.` };
        } else {
            functions.logger.warn("Δεν βρέθηκαν έγκυρες εγγραφές στο αρχείο υπολοίπων.");
            return { message: "Δεν βρέθηκαν έγκυρες εγγραφές." };
        }

    } catch (error) {
        functions.logger.error(`Αποτυχία επεξεργασίας του αρχείου ${filePath}.`, error);
        throw new functions.https.HttpsError('internal', `Η επεξεργασία του αρχείου απέτυχε: ${error.message}`);
    }
});