const functions = require("firebase-functions");
const admin = require("firebase-admin");

exports.deduplicateBottleTypes = functions.region('europe-west1').https.onCall(async (data, context) => {
    // Έλεγχος ασφαλείας
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Πρέπει να είστε συνδεδεμένος.');
    }

    const db = admin.firestore();
    const bottleTypesRef = db.collection('bottleTypes');
    functions.logger.log("Starting deduplication process for 'bottleTypes'...");

    try {
        const snapshot = await bottleTypesRef.get();
        if (snapshot.empty) {
            return { message: "Η συλλογή είναι ήδη άδεια." };
        }

        const documentsByName = new Map();
        // Ομαδοποιούμε όλα τα έγγραφα ανά όνομα
        snapshot.forEach(doc => {
            const docData = doc.data();
            const name = docData.name;
            if (!documentsByName.has(name)) {
                documentsByName.set(name, []);
            }
            documentsByName.get(name).push(doc.id);
        });

        const batch = db.batch();
        let deletedCount = 0;

        // Για κάθε όνομα, αν βρούμε περισσότερα από ένα έγγραφα, κρατάμε το πρώτο και σβήνουμε τα υπόλοιπα
        for (const [name, ids] of documentsByName.entries()) {
            if (ids.length > 1) {
                functions.logger.log(`Found ${ids.length} duplicates for name: "${name}". Keeping one.`);
                // Κρατάμε το πρώτο ID και διαγράφουμε τα υπόλοιπα
                const idsToDelete = ids.slice(1);
                idsToDelete.forEach(id => {
                    batch.delete(bottleTypesRef.doc(id));
                    deletedCount++;
                });
            }
        }

        if (deletedCount > 0) {
            await batch.commit();
            const successMsg = `Επιτυχής καθαρισμός! Διαγράφηκαν ${deletedCount} διπλότυπες εγγραφές.`;
            functions.logger.log(successMsg);
            return { message: successMsg };
        } else {
            const infoMsg = "Δεν βρέθηκαν διπλότυπα. Η συλλογή είναι καθαρή.";
            functions.logger.log(infoMsg);
            return { message: infoMsg };
        }

    } catch (error) {
        functions.logger.error("CRITICAL ERROR during deduplication:", error);
        throw new functions.https.HttpsError('internal', 'Η διαδικασία καθαρισμού απέτυχε.');
    }
});