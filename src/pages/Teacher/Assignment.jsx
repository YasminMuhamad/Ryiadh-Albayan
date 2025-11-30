// pages/Teacher/AssignmentsPage.jsx
import { useState, useEffect, useContext } from "react";
import Sidebar from "../../components/TeacherSidebar.jsx";
import { getDatabase, ref, get, child } from "firebase/database";
import { app } from "../../../firebase.config";
import { TeacherContext } from "../../context/TeacherContext.jsx";

export default function AssignmentsPage() {
  const { teacher } = useContext(TeacherContext); // جلب بيانات المدرس من الـ Context
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);

  const icons = {
    folder: <span>📁</span>,
    file: <span>📄</span>,
    user: <span>👤</span>,
    score: <span>🏆</span>,
  };

  useEffect(() => {
    if (!teacher) return; // تأكد إن بيانات المدرس موجودة قبل جلب الكورسات

    const db = getDatabase(app);
    const dbRef = ref(db);

    async function fetchCourses() {
      try {
        const snapshot = await get(child(dbRef, "courses"));
        if (snapshot.exists()) {
          const data = snapshot.val();

          const subjectsArr = Object.values(data)
            .filter(course => course.teacherId === teacher.id) // استخدام teacher.id من Context
            .map(course => ({
              id: course.courseId,
              name: course.title,
              exams: Object.values(course.modules || {}).flatMap(mod =>
                Object.values(mod.quizzes || {}).map(quiz => ({
                  id: quiz.quizId || quiz.title,
                  title: quiz.title,
                  students: Object.values(quiz.submissions || {}).map(sub => ({
                    id: sub.studentId,
                    name: sub.studentName,
                    score: sub.score,
                    total: sub.totalMarks,
                  })),
                }))
              ),
            }));

          setSubjects(subjectsArr);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }

    fetchCourses();
  }, [teacher]); // إعادة التنفيذ عند تغير بيانات المدرس

  if (loading || !teacher) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="flex-1 p-6 space-y-6 font-sans">
        <h1 className="text-3xl font-bold">
          Assignments for {teacher.name}
        </h1>

        {/* هنا حطي باقي الكود لعرض subjects, exams, students */}
      </div>
    </div>
  );
}
