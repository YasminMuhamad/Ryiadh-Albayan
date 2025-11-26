// import-analytics-sample.cjs
const admin = require("firebase-admin");

// استيراد الـ service account
const serviceAccount = require("./serviceAccountKey.json");

// تهيئة Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// إنشاء عينة monthly_revenue
async function addMonthlyRevenueSample() {
  const sampleData = {
    yearMonth: "2025-11",       // الشهر والسنة
    revenue: 1250,              // إجمالي الإيرادات لهذا الشهر
    newStudents: 3,             // عدد الطلاب الجدد
    activeStudents: 5           // عدد الطلاب النشطين
  };

  try {
    await db.collection("analytics").doc("2025-11").set(sampleData);
    console.log("Monthly revenue sample added!");
  } catch (err) {
    console.error("Error adding sample:", err);
  }
}

addMonthlyRevenueSample();
