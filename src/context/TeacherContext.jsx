// context/TeacherContext.jsx
import React, { createContext, useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../../firebase.config";

export const TeacherContext = createContext();

export function TeacherProvider({ children }) {
  const [teacher, setTeacher] = useState(null);
  const [courses, setCourses] = useState([]);
  const [kpis, setKpis] = useState({
    totalRevenue: 0,
    avgSatisfaction: 0,
    avgCompletion: 0,
    totalStudents: 0,
    totalReviews: 0,
    topCourse: null,
  });

  // ====== replace with your real teacher id or get from auth ======
  const teacherId = "LCrhF5JYJ6VimBY0WOi7";

  // ---- fetch teacher once ----
  useEffect(() => {
    if (!teacherId) return;
    const teacherRef = doc(db, "teachers", teacherId);
    getDoc(teacherRef)
      .then((snap) => {
        if (snap.exists()) setTeacher({ id: snap.id, ...snap.data() });
      })
      .catch((err) => console.error("teacher fetch:", err));
  }, [teacherId]);

  // ---- realtime courses for this teacher ----
  useEffect(() => {
    if (!teacherId) return;

    const q = query(collection(db, "courses"), where("teacherId", "==", teacherId));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCourses(arr);
    }, console.error);

    return () => unsub();
  }, [teacherId]);

  // ---- compute KPIs whenever courses change ----
  useEffect(() => {
    if (!courses) return;

    const totalRevenue = courses.reduce((s, c) => s + (Number(c.revenueTotal) || 0), 0);
    const totalStudents = courses.reduce((s, c) => s + (Number(c.studentsCount) || 0), 0);

    // avg satisfaction: weighted by studentsCount if available, fallback to simple mean
    let avgSatisfaction = 0;
    let totalWeight = 0;
    courses.forEach((c) => {
      const sat = Number(c.avgSatisfaction);
      const weight = Number(c.studentsCount) || 1;
      if (!Number.isNaN(sat)) {
        avgSatisfaction += sat * weight;
        totalWeight += weight;
      }
    });
    avgSatisfaction = totalWeight ? Math.round((avgSatisfaction / totalWeight) * 10) / 10 : 0;

    const avgCompletion =
      courses.length > 0
        ? Math.round((courses.reduce((s, c) => s + (Number(c.avgCompletion) || 0), 0) / courses.length) * 10) / 10
        : 0;

    const totalReviews = courses.reduce((s, c) => s + ((Array.isArray(c.reviews) && c.reviews.length) || 0), 0);

    // topCourse by revenue or avgSatisfaction as fallback
    let topCourse = null;
    if (courses.length) {
      topCourse = [...courses].sort((a, b) => (Number(b.revenueTotal) || 0) - (Number(a.revenueTotal) || 0))[0];
    }

    setKpis({
      totalRevenue,
      avgSatisfaction,
      avgCompletion,
      totalStudents,
      totalReviews,
      topCourse,
    });
  }, [courses]);

  // ======= Simple "free AI" quiz generator (heuristic) =======
  // inputs: course object, options: {type: "mcq"|"tf"|"short", count: number}
  function generateQuizLocally(course, options = { type: "mcq", count: 5 }) {
    // Use course.description + title + module/lesson titles (if present) to generate Qs
    const textSources = [];
    if (course.title) textSources.push(course.title);
    if (course.description) textSources.push(course.description);
    if (course.modules && Array.isArray(course.modules)) {
      course.modules.forEach((m) => {
        if (m.title) textSources.push(m.title);
        if (m.lessons && Array.isArray(m.lessons))
          m.lessons.forEach((l) => l.title && textSources.push(l.title));
      });
    }
    // fallback: if course has no modules, try lessons or use description sentences
    if (course.lessons && Array.isArray(course.lessons)) {
      course.lessons.forEach((l) => l.title && textSources.push(l.title));
    }

    const bigText = textSources.join(". ");
    const sentences = bigText.split(/[\.\n]+/).map(s => s.trim()).filter(Boolean);

    // helper: pick keywords (words longer than 4 letters, excluding stopwords)
    const stopwords = new Set(["which","when","where","what","that","this","with","from","have","would","could","there","their","about","also","these","those","will","your","they","them","each","more","most","such"]);
    const tokens = bigText
      .replace(/[^A-Za-z0-9\u0600-\u06FF\s]/g, " ")
      .split(/\s+/)
      .map(t => t.trim())
      .filter(Boolean);
    const candidates = Array.from(new Set(tokens.filter(t => t.length > 4 && !stopwords.has(t.toLowerCase()))));

    // pick up to count questions
    const qs = [];
    const count = Math.max(1, Math.min(12, options.count || 5));

    for (let i = 0; i < count; i++) {
      // try to pick a sentence with a candidate keyword
      const s = sentences[i] || sentences[Math.floor(Math.random() * sentences.length)] || course.description || course.title || "Read the course content";
      const words = s.split(/\s+/).filter(Boolean);
      // pick an answer word: prefer candidate in sentence
      let answer = words.find(w => candidates.includes(w)) || candidates[Math.floor(Math.random() * candidates.length)] || words[Math.floor(Math.random() * words.length)] || "answer";

      // create question depending on type
      if (options.type === "tf") {
        // True/False: make a statement based on the sentence; randomly flip truth 25% of time
        const truth = Math.random() > 0.25;
        const questionText = s.endsWith(".") ? s : s + ".";
        qs.push({
          id: `q_${i}_${Date.now()}`,
          type: "tf",
          question: questionText,
          correctAnswer: truth ? "True" : "False",
          options: ["True", "False"],
        });
      } else if (options.type === "short") {
        qs.push({
          id: `q_${i}_${Date.now()}`,
          type: "short",
          question: s.replace(answer, "_____"),
          correctAnswer: answer,
        });
      } else {
        // MCQ: create 4 options: correct + 3 distractors
        const distractors = [];
        // use other candidates or mutate correct answer
        const otherCandidates = candidates.filter(c => c !== answer);
        for (let k = 0; k < 3; k++) {
          const pick = otherCandidates.length ? otherCandidates[Math.floor(Math.random() * otherCandidates.length)] : null;
          if (pick) {
            distractors.push(pick);
          } else {
            // simple mutation: remove / add a char
            const d = answer.length > 3 ? answer.slice(0, -1) + String.fromCharCode(97 + Math.floor(Math.random() * 26)) : answer + "s";
            distractors.push(d);
          }
        }
        const optionsArr = [answer, ...distractors].sort(() => Math.random() - 0.5);
        qs.push({
          id: `q_${i}_${Date.now()}`,
          type: "mcq",
          question: s.replace(answer, "_____"),
          options: optionsArr.map((opt) => ({ text: opt, isCorrect: opt === answer })),
          correctAnswer: answer,
        });
      }
    }

    return qs;
  }

  // ===== Optional: save generated quiz to Firestore =====
  async function saveQuizToFirestore(quizPayload) {
    // quizPayload: { title, courseId, questions, createdBy }
    try {
      const docRef = await addDoc(collection(db, "quizzes"), {
        ...quizPayload,
        createdAt: serverTimestamp(),
      });
      return { id: docRef.id, ok: true };
    } catch (err) {
      console.error("save quiz err:", err);
      return { ok: false, error: err.message || err };
    }
  }

  return (
    <TeacherContext.Provider
      value={{
        teacher,
        courses,
        kpis,
        generateQuizLocally,
        saveQuizToFirestore,
      }}
    >
      {children}
    </TeacherContext.Provider>
  );
}
