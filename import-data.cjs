const admin = require("firebase-admin");
const fs = require("fs");

// 1. تحميل ملف JSON اللي فيه البيانات
const data = JSON.parse(fs.readFileSync("riyadh-albayan-data.json", "utf8"));

// 2. إعداد Firebase Admin SDK
const serviceAccount = require("./serviceAccountKey.json"); // لازم يكون في نفس المجلد

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// 3. دالة لإضافة كل مجموعة Collection
async function importCollection(collectionName, documents) {
  const batch = db.batch();

  // بما إن البيانات كائن (object) مش Array
  for (const docId in documents) {
    const docRef = db.collection(collectionName).doc(docId);
    batch.set(docRef, documents[docId]);
  }

  await batch.commit();
  console.log(`✅ Imported collection: ${collectionName}`);
}

// 4. تنفيذ الاستيراد لكل Collections
async function importAll() {
  for (const collectionName in data) {
    await importCollection(collectionName, data[collectionName]);
  }
  console.log("🎉 All collections imported successfully!");
}

importAll().catch((err) => console.error(err));