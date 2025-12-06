import React, { createContext, useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase.config";

export const TeacherContext = createContext();

export function TeacherProvider({ children, teacherId }) {
  const [teacher, setTeacher] = useState(null);
  const [courses, setCourses] = useState([]);
  const [studentsCount, setStudentsCount] = useState(0);
  const [liveSessions, setLiveSessions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [kpis, setKpis] = useState({
    totalRevenue: 0,
    avgSatisfaction: 0,
    avgCompletion: 0,
    totalStudents: 0,
    totalReviews: 0,
    topCourse: null,
  });

  // ---- fetch teacher info ----
  useEffect(() => {
    if (!teacherId) return;
    const teacherRef = doc(db, "teachers", teacherId);
    getDoc(teacherRef)
      .then((snap) => {
        if (snap.exists()) setTeacher({ id: snap.id, ...snap.data() });
      })
      .catch(console.error);
  }, [teacherId]);

  // ---- realtime courses ----
  useEffect(() => {
    if (!teacherId) return;
    const q = query(collection(db, "courses"), where("teacherId", "==", teacherId));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCourses(arr);
    }, console.error);
    return () => unsub();
  }, [teacherId]);

  // ---- students count ----
  useEffect(() => {
    getDocs(collection(db, "students")).then((snap) => setStudentsCount(snap.size));
  }, []);

  // ---- live sessions ----
  useEffect(() => {
    if (!teacherId) return;
    const q = query(collection(db, "liveSessions"), where("teacherId", "==", teacherId));
    const unsub = onSnapshot(q, (snap) => {
      setLiveSessions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, console.error);
    return () => unsub();
  }, [teacherId]);

  // ---- quizzes ----
  useEffect(() => {
    if (!teacherId) return;
    const q = query(collection(db, "quizzes"), where("createdBy", "==", teacherId));
    const unsub = onSnapshot(q, (snap) => {
      setQuizzes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, console.error);
    return () => unsub();
  }, [teacherId]);

  // ---- calculate KPIs ----
  useEffect(() => {
    if (!courses) return;
    const totalRevenue = courses.reduce((sum, c) => sum + (Number(c.revenueTotal) || 0), 0);
    const totalStudents = courses.reduce((sum, c) => sum + (Number(c.studentsCount) || 0), 0);

    let avgSatisfaction = 0;
    let weight = 0;
    courses.forEach((c) => {
      const sat = Number(c.avgSatisfaction);
      const w = Number(c.studentsCount) || 1;
      if (!Number.isNaN(sat)) {
        avgSatisfaction += sat * w;
        weight += w;
      }
    });
    avgSatisfaction = weight ? Math.round((avgSatisfaction / weight) * 10) / 10 : 0;

    const avgCompletion =
      courses.length > 0
        ? Math.round((courses.reduce((s, c) => s + (Number(c.avgCompletion) || 0), 0) / courses.length) * 10) / 10
        : 0;

    const totalReviews = courses.reduce((s, c) => s + ((Array.isArray(c.reviews) && c.reviews.length) || 0), 0);
    const topCourse = courses.length ? [...courses].sort((a, b) => (Number(b.revenueTotal) || 0) - (Number(a.revenueTotal) || 0))[0] : null;

    setKpis({ totalRevenue, avgSatisfaction, avgCompletion, totalStudents, totalReviews, topCourse });
  }, [courses]);

  return (
    <TeacherContext.Provider
      value={{
        teacher,
        courses,
        studentsCount,
        liveSessions,
        quizzes,
        kpis,
      }}
    >
      {children}
    </TeacherContext.Provider>
  );
}
