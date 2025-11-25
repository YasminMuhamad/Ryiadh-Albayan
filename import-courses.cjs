const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// ---------------------
// 1. Firebase Initialization
// ---------------------
const serviceAccount = require("./serviceAccountKey.json"); // لازم يكون موجود في نفس الفولدر

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ---------------------
// 2. Load courses JSON
// ---------------------
const coursesPath = path.join(__dirname, 'teachers-courses.json');
const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));

// ---------------------
// 3. Import function
// ---------------------
async function importCourses() {
  try {
    for (const course of coursesData) {
      const docRef = db.collection('courses').doc(); // ID تلقائي
      await docRef.set({
        title: course.title,
        title_ar: course.title_ar,
        description: course.description,
        price: course.price,
        thumbnail: course.thumbnail,
        teacherId: course.teacherId,
        termId: course.termId,
        type: course.type,
        totalLessons: course.totalLessons,
        totalModules: course.totalModules,
        studentsCount: course.studentsCount,
        modules: course.modules,
        reviews: course.reviews,
        createdAt: new Date()
      });
      console.log(`✅ Course uploaded: ${course.title}`);
    }
    console.log('🎉 All courses imported successfully!');
  } catch (error) {
    console.error('❌ Error importing courses:', error);
  }
}

// ---------------------
// 4. Run import
// ---------------------
importCourses();
