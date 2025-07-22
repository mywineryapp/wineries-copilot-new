const functions = require("firebase-functions");
const admin = require("firebase-admin");

exports.populateBottleTypesFromInvoices = functions.region('europe-west1').https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Πρέπει να είστε συνδεδεμένος.');
    }

    const db = admin.firestore();
    const invoicesRef = db.collection('invoices');
    const bottleTypesRef = db.collection('bottleTypes');
    functions.logger.log("Starting TRUE SYNC for bottle types...");

    try {
        // --- Βήμα 1: Βρίσκουμε την "Πηγή της Αλήθειας" ---
        // Παίρνουμε ΟΛΕΣ τις μοναδικές, καθαρές ονομασίες φιαλών από τα τιμολόγια.
        const invoicesSnapshot = await invoicesRef.get();
        if (invoicesSnapshot.empty) {
            return { message: "Δεν βρέθηκαν τιμολόγια." };
        }
        const sourceOfTruthNames = new Set();
        invoicesSnapshot.forEach(doc => {
            const bottleInfo = doc.data().bottleInfo;
            if (bottleInfo && typeof bottleInfo === 'string' && bottleInfo.trim() !== '') {
                sourceOfTruthNames.add(bottleInfo.trim());
            }
        });
        functions.logger.log(`Source of truth contains ${sourceOfTruthNames.size} unique names.`);

        // --- Βήμα 2: Βρίσκουμε την τωρινή κατάσταση στις "Ρυθμίσεις" ---
        const settingsSnapshot = await bottleTypesRef.get();
        const settingsItems = new Map();
        settingsSnapshot.forEach(doc => {
            settingsItems.set(doc.data().name, doc.id);
        });
        functions.logger.log(`Settings currently contain ${settingsItems.size} names.`);

        const batch = db.batch();
        let addedCount = 0;
        let deletedCount = 0;

        // --- Βήμα 3: Προσθέτουμε ό,τι λείπει ---
        sourceOfTruthNames.forEach(name => {
            if (!settingsItems.has(name)) {
                const newDocRef = bottleTypesRef.doc();
                batch.set(newDocRef, { name: name, active: true, sortOrder: 999 });
                addedCount++;
            }
        });
        if(addedCount > 0) functions.logger.log(`Adding ${addedCount} new types to settings.`);

        // --- Βήμα 4: Διαγράφουμε ό,τι περισσεύει ---
        settingsItems.forEach((id, name) => {
            if (!sourceOfTruthNames.has(name)) {
                batch.delete(bottleTypesRef.doc(id));
                deletedCount++;
            }
        });
        if(deletedCount > 0) functions.logger.log(`Deleting ${deletedCount} obsolete types from settings.`);

        // --- Βήμα 5: Εκτελούμε τις αλλαγές ---
        if (addedCount > 0 || deletedCount > 0) {
            await batch.commit();
            return { message: `Επιτυχής συγχρονισμός! Προστέθηκαν ${addedCount} και διαγράφηκαν ${deletedCount} εγγραφές.` };
        } else {
            return { message: "Όλα είναι ήδη συγχρονισμένα!" };
        }

    } catch (error) {
        functions.logger.error("CRITICAL ERROR during true sync:", error);
        throw new functions.https.HttpsError('internal', 'Η διαδικασία συγχρονισμού απέτυχε.');
    }
});