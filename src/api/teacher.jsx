// src/api/teacher.js
import { db } from "../firebase.config";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

const teacherId = "LCrhF5JYJ6VimBY0WOi7"; // مؤقت

export const fetchTeacherData = async () => {
  const teacherRef = doc(db, "teachers", teacherId);
  const teacherSnap = await getDoc(teacherRef);
  if (teacherSnap.exists()) return teacherSnap.data();
  return null;
};

export const fetchTeacherCourses = async () => {
  const q = query(collection(db, "courses"), where("teacherId", "==", teacherId));
  const snapshot = await getDocs(q);
  const courses = [];
  snapshot.forEach((doc) => courses.push({ id: doc.id, ...doc.data() }));
  return courses;
};
