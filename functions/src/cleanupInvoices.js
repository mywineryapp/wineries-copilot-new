const functions = require("firebase-functions");
const admin = require("firebase-admin");

exports.cleanupInvoiceNotes = functions.region('europe-west1').https.onCall(async (data, context) => {
    const db = admin.firestore();
    const invoicesRef = db.collection('invoices');
    const snapshot = await invoicesRef.get();

    if (snapshot.empty) {
        functions.logger.log("No invoices found to process.");
        return { message: "No invoices found." };
    }

    const batch = db.batch();
    let updates = 0;

    snapshot.forEach(doc => {
        const invoice = doc.data();
        const notes = invoice.notes;
        let needsUpdate = false;
        const dataToUpdate = {};

        if (notes && typeof notes === 'string') {
            const parts = notes.split('|').map(part => part.trim());
            
            parts.forEach(part => {
                if (part.toUpperCase().startsWith('ΦΙΑΛΗ')) {
                    dataToUpdate.bottleInfo = part;
                    needsUpdate = true;
                } else if (part.toUpperCase().startsWith('ΟΙΝΟΣ')) {
                    dataToUpdate.wineInfo = part;
                    needsUpdate = true;
                }
            });
        }

        if (needsUpdate) {
            batch.update(doc.ref, dataToUpdate);
            updates++;
        }
    });

    if (updates > 0) {
        await batch.commit();
        functions.logger.log(`Successfully updated ${updates} invoices.`);
        return { message: `Successfully updated ${updates} invoices.` };
    } else {
        functions.logger.log("No invoices needed updating.");
        return { message: "No invoices needed updating." };
    }
});