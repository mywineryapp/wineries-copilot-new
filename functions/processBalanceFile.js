const functions = require("firebase-functions");
const admin = require("firebase-admin");
const xlsx = require("xlsx");

const cleanAndParseNumber = (val) => {
    if (val === null || val === undefined || val === '') return 0;
    let stringValue = String(val).replace(/€/g, '').trim().replace(/\./g, '').replace(',', '.');
    const number = parseFloat(stringValue);
    return isNaN(number) ? 0 : number;
};

exports.processBalanceFile = functions.region('europe-west1').runWith({timeoutSeconds: 300, memory: '1GB'}).storage.object().onFinalize(async (object) => {
    const { bucket, name: filePath, contentType } = object;

    if (!filePath.startsWith('balance-uploads/')) {
        functions.logger.log("File is not in balance-uploads folder. Ignoring.");
        return null;
    }

    const storageBucket = admin.storage().bucket(bucket);
    const db = admin.firestore();
    
    functions.logger.log(`Starting processing of balance file: ${filePath}`);

    try {
        const fileBuffer = (await storageBucket.file(filePath).download())[0];
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        const headers = data[0].map(h => h ? h.trim() : '');
        let recordsProcessed = 0;
        
        const batchPromises = [];
        let batch = db.batch();
        let counter = 0;

        for (let i = 1; i < data.length; i++) {
            const rowArray = data[i];
            const rowData = {};
            headers.forEach((header, index) => {
                rowData[header] = rowArray[index];
            });

            const customerId = rowData['Κωδικός']?.trim();
            if (!customerId) continue;

            const docRef = db.collection("customer_balances").doc(customerId);
            
            // ✅✅✅ Η ΔΙΟΡΘΩΣΗ ΕΙΝΑΙ ΕΔΩ ✅✅✅
            const balanceData = {
                customerId: customerId,
                customerName: rowData['Επωνυμία']?.trim() || null,
                totalBalance: cleanAndParseNumber(rowData['Υπόλοιπο']),
                days_0_30:    cleanAndParseNumber(rowData['0-30']),
                days_31_60:   cleanAndParseNumber(rowData['31-60']),
                days_61_90:   cleanAndParseNumber(rowData['61-90']),
                days_91_120:  cleanAndParseNumber(rowData['91-120']),
                days_121_150: cleanAndParseNumber(rowData['121-150']),
                days_151_plus:  cleanAndParseNumber(rowData['151-']), // Διορθώθηκε από '+' σε '-'
                balanceLastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            };
            
            batch.set(docRef, balanceData, { merge: true });
            counter++;
            recordsProcessed++;

            if (counter >= 400) {
                batchPromises.push(batch.commit());
                batch = db.batch();
                counter = 0;
            }
        }

        if (counter > 0) {
            batchPromises.push(batch.commit());
        }

        await Promise.all(batchPromises);

        functions.logger.log(`Successfully processed and committed ${recordsProcessed} balance records.`);
        return { message: `Επιτυχής ενημέρωση ${recordsProcessed} εγγραφών.` };

    } catch (error) {
        functions.logger.error(`Failed to process file ${filePath}.`, error);
        throw new functions.https.HttpsError('internal', `Η επεξεργασία του αρχείου απέτυχε: ${error.message}`);
    }
});