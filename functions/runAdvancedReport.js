const functions = require("firebase-functions");
const admin = require("firebase-admin");

exports.runAdvancedReport = functions.region('europe-west1').https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Πρέπει να είστε συνδεδεμένος.');
    }

    const { selectedWinery, selectedClosure, selectedWine, selectedBottleType } = data;
    const db = admin.firestore();
    
    try {
        // Παίρνουμε όλα τα οινοποιεία για να έχουμε τα ονόματά τους
        const wineriesSnap = await db.collection('wineries').get();
        const wineriesMap = new Map(wineriesSnap.docs.map(doc => [doc.id, doc.data().name]));

        // Ξεκινάμε το query μας στη συλλογή 'orders'
        let q = db.collection('orders');

        // Αν έχει επιλεγεί οινοποιείο, το προσθέτουμε ως το βασικό φίλτρο
        if (selectedWinery) {
            q = q.where('wineryId', '==', selectedWinery);
        }

        const snapshot = await q.get();
        if (snapshot.empty) {
            return { results: [] };
        }

        let results = [];
        snapshot.forEach(doc => {
            const order = doc.data();
            if (order && Array.isArray(order.products)) {
                order.products.forEach((product, index) => {
                    const matchesClosure = !selectedClosure || product.closureTypeId === selectedClosure;
                    const matchesWine = !selectedWine || product.wineTypeId === selectedWine;
                    const matchesBottleType = !selectedBottleType || product.bottleTypeId === selectedBottleType;

                    if (matchesClosure && matchesWine && matchesBottleType) {
                        results.push({
                            id: `${doc.id}-${index}`,
                            wineryId: order.wineryId,
                            wineryName: wineriesMap.get(order.wineryId) || order.wineryId,
                            // Εδώ θα χρειαστούμε τις λίστες προϊόντων για να βρούμε τα ονόματα.
                            // Προς το παρόν, θα δείχνουμε τα ID.
                            product: product.wineTypeId || 'N/A',
                            closure: product.closureTypeId || 'N/A',
                            bottle: product.bottleTypeId || 'N/A',
                            quantity: product.quantity || 0,
                        });
                    }
                });
            }
        });

        // Αν δεν είχαμε φιλτράρει με οινοποιείο, πρέπει να ομαδοποιήσουμε τα αποτελέσματα
        if (!selectedWinery) {
            const grouped = results.reduce((acc, item) => {
                if (!acc[item.wineryId]) {
                    acc[item.wineryId] = { wineryId: item.wineryId, wineryName: item.wineryName, count: 0 };
                }
                acc[item.wineryId].count++;
                return acc;
            }, {});
            return { results: Object.values(grouped) };
        }

        return { results: results };

    } catch (error) {
        functions.logger.error("Error in advanced report:", error);
        throw new functions.https.HttpsError('internal', 'Η εκτέλεση της αναφοράς απέτυχε.');
    }
});