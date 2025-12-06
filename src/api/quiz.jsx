// src/api/quiz.js
import { db } from "../firebase.config";
import { collection, addDoc } from "firebase/firestore";

const teacherId = "LCrhF5JYJ6VimBY0WOi7"; // مؤقت

export const addQuiz = async (courseId, quiz) => {
  const quizData = {
    ...quiz,
    courseId,
    teacherId,
    createdAt: new Date().toISOString(),
  };

  const docRef = await addDoc(collection(db, "quizzes"), quizData);
  return docRef.id;
};
