import { addDocument, getCollection } from '../services/firestore';

export async function addOptionIfNotExists(collectionName, label, db) {
  if (!label || !label.trim()) return;

  try {
    const snapshot = await getCollection(collectionName);
    const exists = snapshot.docs.some(doc => doc.id.toLowerCase() === label.toLowerCase());
    if (!exists) {
      await addDocument(collectionName, { label }, db);
      console.log(`🔹 Νέα τιμή "${label}" προστέθηκε στη συλλογή ${collectionName}`);
    }
  } catch (err) {
    console.error(`❌ Error checking/adding label "${label}" to ${collectionName}`, err);
  }
}