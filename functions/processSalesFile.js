const functions = require("firebase-functions");
const admin = require("firebase-admin");
const xlsx = require("xlsx");

const cleanAndParseNumber = (val) => {
    if (val === null || val === undefined || val === '') return 0;
    let stringValue = String(val).replace(/€/g, '').trim().replace(/\./g, '').replace(',', '.');
    const number = parseFloat(stringValue);
    return isNaN(number) ? 0 : number;
};

exports.processSalesFile = functions.region('europe-west1').runWith({timeoutSeconds: 540, memory: '1GB'}).storage.object().onFinalize(async (object) => {
    const { bucket, name: filePath, contentType } = object;

    if (!filePath.startsWith('sales-uploads/')) {
        functions.logger.log("File is not in sales-uploads folder.");
        return null;
    }
    if (!contentType.includes('spreadsheetml') && !contentType.includes('ms-excel')) {
        functions.logger.log("File is not an Excel file.", contentType);
        return null;
    }

    const storageBucket = admin.storage().bucket(bucket);
    const db = admin.firestore();
    let batch = db.batch();
    let counter = 0;
    let totalProcessed = 0;

    functions.logger.log(`Starting processing of Excel file: ${filePath}`);

    try {
        const fileBuffer = (await storageBucket.file(filePath).download())[0];
        const workbook = xlsx.read(fileBuffer, { type: 'buffer', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const data = xlsx.utils.sheet_to_json(worksheet, {
            header: 1,
            transform: (header) => header.trim()
        });

        const headers = data[0].map(h => h ? h.trim() : '');
        
        for (let i = 1; i < data.length; i++) {
            const rowArray = data[i];
            const rowData = {};
            headers.forEach((header, index) => {
                rowData[header] = rowArray[index];
            });

            const docRef = db.collection('invoices').doc();
            
            let bottleInfo = rowData['Φιάλη']?.trim() || null;
            let wineInfo = rowData['Οίνος']?.trim() || null;

            const notes = rowData['Σημείωση']?.trim() || null;
            if (notes && typeof notes === 'string') {
                const parts = notes.split('|').map(part => part.trim());
                parts.forEach(part => {
                    if (part.toUpperCase().startsWith('ΦΙΑΛΗ') && !bottleInfo) {
                        bottleInfo = part.substring(5).trim();
                    } else if (part.toUpperCase().startsWith('ΟΙΝΟΣ') && !wineInfo) {
                        wineInfo = part.substring(5).trim();
                    }
                });
            }

            const docData = {
                date: rowData['Ημερομηνία'] ? admin.firestore.Timestamp.fromDate(new Date(rowData['Ημερομηνία'])) : null,
                wineryId: rowData['Κωδ.Πελάτη']?.trim() || null,
                wineryName: rowData['Επωνυμία']?.trim() || null,
                quantity: cleanAndParseNumber(rowData['Ποσότητα']),
                productDescription: rowData['Περιγραφή']?.trim() || null,
                unitPrice: cleanAndParseNumber(rowData['Τιμή Μονάδος']),
                notes: notes,
                bottleInfo: bottleInfo,
                wineInfo: wineInfo,
                importedAt: admin.firestore.Timestamp.now()
            };
            
            batch.set(docRef, docData);
            counter++;

            if (counter >= 400) {
                await batch.commit();
                totalProcessed += counter;
                functions.logger.log(`Committed batch. Total processed: ${totalProcessed}`);
                batch = db.batch();
                counter = 0;
            }
        }

        if (counter > 0) {
            await batch.commit();
            totalProcessed += counter;
        }
        
        functions.logger.log(`Successfully processed ${totalProcessed} records from ${filePath}.`);
        return { message: `Successfully processed ${totalProcessed} records.` };

    } catch (error) {
        functions.logger.error(`Failed to process file ${filePath}.`, error);
        throw new functions.https.HttpsError('internal', `File processing failed: ${error.message}`);
    }
});