const functions = require("firebase-functions");
const admin = require("firebase-admin");

exports.normalizeBottleInfo = functions.region('europe-west1').https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Πρέπει να είστε συνδεδεμένος.');
    }

    const { oldNames, newName } = data;

    if (!Array.isArray(oldNames) || oldNames.length === 0 || !newName || typeof newName !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Τα δεδομένα που στάλθηκαν δεν είναι έγκυρα.');
    }

    const db = admin.firestore();
    const invoicesRef = db.collection('invoices');
    // Χρησιμοποιούμε το 'in' για να βρούμε όλα τα έγγραφα που ταιριάζουν με τις παλιές ονομασίες
    const q = invoicesRef.where('bottleInfo', 'in', oldNames);
    const snapshot = await q.get();

    if (snapshot.empty) {
        return { message: "Δεν βρέθηκαν εγγραφές για ενημέρωση." };
    }

    const batch = db.batch();
    snapshot.forEach(doc => {
        batch.update(doc.ref, { bottleInfo: newName });
    });

    await batch.commit();

    return { message: `Επιτυχής ενημέρωση! ${snapshot.size} εγγραφές άλλαξαν σε "${newName}".` };
});