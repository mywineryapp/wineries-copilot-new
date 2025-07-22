const functions = require("firebase-functions");
// ✅✅✅ ΕΦΑΡΜΟΓΗ ΤΗΣ ΔΙΚΗΣ ΣΟΥ ΛΥΣΗΣ ✅✅✅
const algoliasearchModule = require("algoliasearch");
const algoliasearch = algoliasearchModule.default || algoliasearchModule;

const admin = require("firebase-admin");

// --- Configuration ---
const APP_ID = functions.config().algolia.app_id;
const ADMIN_KEY = functions.config().algolia.api_key;
const INDEX_NAME = functions.config().algolia.index_name;

const client = algoliasearch(APP_ID, ADMIN_KEY);
const index = client.initIndex(INDEX_NAME);

// --- Functions ---
exports.onInvoiceCreated = functions.region('europe-west1').firestore
    .document('invoices/{invoiceId}')
    .onCreate(async (snap, context) => {
        const invoiceData = snap.data();
        const objectID = snap.id;

        const record = {
            objectID: objectID,
            wineryName: invoiceData.wineryName,
            productDescription: invoiceData.productDescription,
            quantity: invoiceData.quantity,
            date: invoiceData.date ? invoiceData.date.toMillis() : null,
        };

        try {
            await index.saveObject(record);
            functions.logger.log(`Invoice ${objectID} successfully indexed.`);
        } catch (error) {
            functions.logger.error(`Error indexing invoice ${objectID}:`, error);
        }
    });

exports.onInvoiceUpdated = functions.region('europe-west1').firestore
    .document('invoices/{invoiceId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const objectID = change.after.id;

        const record = {
            objectID: objectID,
            wineryName: newData.wineryName,
            productDescription: newData.productDescription,
            quantity: newData.quantity,
            date: newData.date ? newData.date.toMillis() : null,
        };

        try {
            await index.saveObject(record);
            functions.logger.log(`Invoice ${objectID} successfully updated.`);
        } catch (error) {
            functions.logger.error(`Error updating invoice ${objectID}:`, error);
        }
    });

exports.onInvoiceDeleted = functions.region('europe-west1').firestore
    .document('invoices/{invoiceId}')
    .onDelete(async (snap, context) => {
        const objectID = snap.id;

        try {
            await index.deleteObject(objectID);
            functions.logger.log(`Invoice ${objectID} successfully deleted.`);
        } catch (error) {
            functions.logger.error(`Error deleting invoice ${objectID}:`, error);
        }
    });
    /**
 * ✅✅✅ Η ΝΕΑ FUNCTION ΕΙΝΑΙ ΕΔΩ ✅✅✅
 * Αυτή είναι μια onCall function που μπορούμε να την "καλέσουμε" μία φορά
 * για να στείλει όλες τις υπάρχουσες εγγραφές στο Algolia.
 */
exports.massIndexInvoices = functions.region('europe-west1').https.onCall(async (data, context) => {
    // Έλεγχος ασφαλείας
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Πρέπει να είστε συνδεδεμένος.');
    }

    functions.logger.log("Starting mass indexing for all invoices...");

    const invoicesRef = admin.firestore().collection('invoices');
    const snapshot = await invoicesRef.get();

    if (snapshot.empty) {
        functions.logger.log("No invoices found to index.");
        return { message: "No invoices found." };
    }

    const records = snapshot.docs.map(doc => {
        const invoiceData = doc.data();
        return {
            objectID: doc.id,
            wineryName: invoiceData.wineryName,
            productDescription: invoiceData.productDescription,
            quantity: invoiceData.quantity,
            date: invoiceData.date ? invoiceData.date.toMillis() : null,
        };
    });

    try {
        await index.saveObjects(records);
        functions.logger.log(`Successfully indexed ${records.length} invoices.`);
        return { message: `Successfully indexed ${records.length} invoices.` };
    } catch (error) {
        functions.logger.error(`Error during mass indexing:`, error);
        throw new functions.https.HttpsError('internal', 'Mass indexing failed.');
    }
});