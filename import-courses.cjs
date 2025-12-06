// upload-quizzes-admin.js
// تشغيل: node upload-quizzes-admin.js

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); // ملف مفاتيح الخدمة عندك

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const quizTemplate = {
  title: "General Understanding Quiz",
  teacherId: "qLuUZB3pKTeWvy9fR8S5Ao4uKci1",
  createdAt: null,
  questions: [
    {
      question: "Q1. What is the main purpose of this lesson?",
      options: [
        "A. To confuse the student",
        "B. To review basic knowledge",
        "C. To skip learning",
        "D. To test speed only"
      ],
      correct: "B. To review basic knowledge",
      type: "mcq"
    }
  ]
};

async function addQuizToAllModules() {
  try {
    const coursesSnap = await db.collection("courses").get();
    console.log(`Found ${coursesSnap.size} courses.`);

    for (const courseDoc of coursesSnap.docs) {
      const courseId = courseDoc.id;
      const modulesRef = courseDoc.ref.collection("modules");
      const modulesSnap = await modulesRef.get();

      console.log(`Course ${courseId} has ${modulesSnap.size} modules.`);

      for (const moduleDoc of modulesSnap.docs) {
        const moduleId = moduleDoc.id;

        // اختاري: add() لإنشاء id تلقائي أو doc(id) لو عايزة ID محدد
        const quizRef = modulesRef.doc(moduleId).collection("quizzes").doc(); // random id
        const payload = {
          ...quizTemplate,
          courseId,
          moduleId,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await quizRef.set(payload, { merge: true });
        console.log(` -> Created quiz ${quizRef.id} for module ${moduleId} in course ${courseId}`);
      }
    }

    console.log("Done: added quizzes to all modules.");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

addQuizToAllModules();
