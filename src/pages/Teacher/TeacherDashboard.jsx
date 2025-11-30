import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  BookOpen,
  Video,
  FileQuestion,
  Bell,
  Calendar,
  Plus,
} from "lucide-react";
import "../../styles/globals.css";
import Sidebar from "../../components/TeacherSidebar.jsx";

// Firebase
import { db } from "../../../firebase.config";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

// Context
import { TeacherContext } from "../../context/TeacherContext.jsx";

// KPI CARD
const KPICard = ({ title, value, icon: Icon, trend, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white border border-[var(--primary)] p-4 rounded-[var(--radius)] flex items-center justify-between cursor-pointer hover:bg-[var(--secondary)] transition"
  >
    <div className="flex items-center gap-3">
      <div className="bg-[var(--primary)] p-2 rounded flex items-center justify-center">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="font-bold text-lg text-[var(--foreground)]">{value}</p>
        <p className="text-sm text-[var(--foreground)]/70">{title}</p>
      </div>
    </div>
    <p className="text-sm text-[var(--primary)] font-medium">{trend}</p>
  </div>
);

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { teacher } = useContext(TeacherContext);
  const teacherId = teacher?.id || "LCrhF5JYJ6VimBY0WOi7";

  // ===== STATES =====
  const [courses, setCourses] = useState([]);
  const [studentsCount, setStudentsCount] = useState(0);
  const [liveSessionsCount, setLiveSessionsCount] = useState(0);
  const [quizzesCount, setQuizzesCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);

  // ===== MODAL QUIZ STATES =====
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [newQuizQuestions, setNewQuizQuestions] = useState([
    { question: "", options: ["", "", "", ""], correct: 0 },
  ]);

  // ===== FORMAT TIME =====
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const diff = Math.floor((Date.now() - timestamp.toDate()) / (1000 * 60 * 60));
    if (diff < 1) return "Just now";
    if (diff < 24) return `${diff}h ago`;
    return timestamp.toDate().toLocaleDateString();
  };

  // ===== FETCH FIREBASE DATA =====
  useEffect(() => {
    if (!teacher) return;

    // Courses
    const coursesQuery = query(
      collection(db, "courses"),
      where("teacherId", "==", teacherId)
    );
    getDocs(coursesQuery)
      .then((snap) =>
        setCourses(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      )
      .catch(console.error);

    // Students count
    getDocs(collection(db, "students"))
      .then((snap) => setStudentsCount(snap.size))
      .catch(console.error);

    // Live sessions
    getDocs(collection(db, "liveSessions"))
      .then((snap) => setLiveSessionsCount(snap.size))
      .catch(console.error);

    // Quizzes
    getDocs(collection(db, "quizzes"))
      .then((snap) => setQuizzesCount(snap.size))
      .catch(console.error);

    // Recent Activity (آخر 4 أحداث)
    const activityQuery = query(
      collection(db, "activities"),
      orderBy("timestamp", "desc")
    );
    const unsubActivity = onSnapshot(activityQuery, (snap) => {
      setRecentActivities(
        snap.docs.slice(0, 4).map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });

    // Upcoming Sessions
    const sessionQuery = query(
      collection(db, "upcomingSessions"),
      where("teacherId", "==", teacherId),
      orderBy("timestamp", "asc")
    );
    const unsubSessions = onSnapshot(sessionQuery, (snap) => {
      setUpcomingSessions(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubActivity();
      unsubSessions();
    };
  }, [teacher]);

  if (!teacher) return <div className="p-6">Loading teacher data...</div>;

  // ===== KPI DATA =====
  const kpiData = [
    { type: "courses", title: "My Courses", value: courses.length, icon: BookOpen, trend: "+3%", link: "/teacher/courses" },
    { type: "students", title: "Students", value: studentsCount, icon: Users, trend: "+5%", link: "/teacher/students" },
    { type: "live", title: "Live Sessions", value: liveSessionsCount, icon: Video, trend: "+2%", link: "/teacher/live" },
    { type: "quizzes", title: "Quizzes", value: quizzesCount, icon: FileQuestion, trend: "+1%", link: "/teacher/assignment" },
  ];

  // ===== HANDLE ADD QUIZ =====
  const handleAddQuiz = async () => {
    if (!selectedCourse) return alert("Select a course first!");
    const quizRef = collection(db, "quizzes");
    await addDoc(quizRef, {
      title: newQuizTitle || "New Quiz",
      courseId: selectedCourse.id,
      teacherId,
      createdAt: serverTimestamp(),
      questions: newQuizQuestions,
    });
    alert("Quiz added!");
    setShowQuizForm(false);
    setNewQuizTitle("");
    setNewQuizQuestions([{ question: "", options: ["", "", "", ""], correct: 0 }]);
  };

  // ===== QUICK ACTIONS =====
  const quickActions = [
    { action: "createCourse", icon: BookOpen, title: "Create Course", desc: "Start a new course", onClick: () => navigate("/create-course") },
    { action: "scheduleLive", icon: Video, title: "Schedule Live", desc: "Schedule a live session", onClick: () => navigate("/schedule-live") },
    { action: "addAnnouncement", icon: Bell, title: "Add Announcement", desc: "Post to your courses", onClick: () => navigate("/add-announcement") },
    { action: "addQuiz", icon: FileQuestion, title: "Add Quiz", desc: "Create an assessment", onClick: () => setShowQuizForm(true) },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="flex-1 p-6 space-y-6 font-[Poppins]">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold mb-2 text-[var(--foreground)]">
              Welcome Back, {teacher.name} 👋
            </h1>
            <p className="text-[var(--foreground)]/70 text-sm">
              Here's what's happening with your courses today
            </p>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map((kpi) => (
            <KPICard key={kpi.type} {...kpi} onClick={() => navigate(kpi.link)} />
          ))}
        </div>

        {/* RECENT ACTIVITY + QUICK ACTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-semibold mb-3 text-[var(--primary)]">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 p-3 bg-[var(--card)] rounded-[var(--radius)] hover:bg-[var(--secondary)] cursor-pointer">
                  <div className="w-10 h-10 bg-[var(--secondary)] rounded-full flex items-center justify-center">
                    {act.type === "quiz" ? <FileQuestion className="w-5 h-5 text-[var(--primary)]"/> :
                     act.type === "course" ? <BookOpen className="w-5 h-5 text-[var(--primary)]"/> :
                     <Calendar className="w-5 h-5 text-[var(--primary)]"/>}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{act.title}</p>
                    <p className="text-[var(--foreground)]/60 text-sm">{act.description}</p>
                    <p className="text-[var(--foreground)]/40 text-xs mt-1">{formatTime(act.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-2xl font-semibold mb-3 text-[var(--primary)]">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((a) => (
                <button key={a.action} onClick={a.onClick} className="flex items-center gap-3 p-3 bg-[var(--card)] rounded-[var(--radius)] hover:bg-[var(--secondary)]">
                  <div className="w-10 h-10 bg-[var(--primary)] text-white flex items-center justify-center rounded-[var(--radius)]">
                    <a.icon className="w-5 h-5"/>
                  </div>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{a.title}</p>
                    <p className="text-sm text-[var(--foreground)]/60">{a.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* UPCOMING SESSIONS */}
        <div>
          <h2 className="text-2xl font-semibold mb-3 text-[var(--primary)]">Upcoming Live Sessions</h2>
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-[var(--card)] rounded-[var(--radius)] hover:bg-[var(--secondary)]">
                <div className="flex items-center gap-3">
                  <Video className="w-6 h-6 text-[var(--primary)]"/>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{session.title}</p>
                    <p className="text-[var(--foreground)]/60 text-sm">{new Date(session.timestamp?.toDate()).toLocaleString()} • {session.duration}</p>
                  </div>
                </div>
                <div className="bg-[var(--secondary)] px-2 py-1 rounded text-sm">{session.badge}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== ADD QUIZ MODAL ===== */}
        {showQuizForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-[var(--radius)] w-[500px] max-h-[90vh] overflow-auto space-y-4">
              <h2 className="text-xl font-semibold mb-3 text-[var(--primary)]">Add New Quiz</h2>
              
              {/* Select Course */}
              <label className="block font-medium mb-1">Select Course</label>
              <select className="w-full p-2 border rounded" value={selectedCourse?.id || ""} onChange={(e) => setSelectedCourse(courses.find(c => c.id === e.target.value))}>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>

              {/* Quiz Title */}
              <label className="block font-medium mb-1 mt-3">Quiz Title</label>
              <input className="w-full p-2 border rounded" value={newQuizTitle} onChange={(e) => setNewQuizTitle(e.target.value)} />

              {/* Questions */}
              {newQuizQuestions.map((q, i) => (
                <div key={i} className="border p-2 rounded mt-2 space-y-1">
                  <label>Question {i + 1}</label>
                  <input className="w-full p-1 border rounded" value={q.question} onChange={(e) => {
                    const temp = [...newQuizQuestions]; temp[i].question = e.target.value; setNewQuizQuestions(temp);
                  }} />
                  {q.options.map((opt, j) => (
                    <input key={j} className="w-full p-1 border rounded mt-1" value={opt} onChange={(e) => {
                      const temp = [...newQuizQuestions]; temp[i].options[j] = e.target.value; setNewQuizQuestions(temp);
                    }} placeholder={`Option ${j + 1}`} />
                  ))}
                  <label className="mt-1">Correct Answer (0-3)</label>
                  <input type="number" min="0" max="3" className="w-full p-1 border rounded" value={q.correct} onChange={(e) => {
                    const temp = [...newQuizQuestions]; temp[i].correct = Number(e.target.value); setNewQuizQuestions(temp);
                  }} />
                </div>
              ))}

              <button className="bg-[var(--primary)] text-white px-4 py-2 rounded mt-4" onClick={handleAddQuiz}>Save Quiz</button>
              <button className="ml-2 px-4 py-2 rounded border" onClick={() => setShowQuizForm(false)}>Cancel</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TeacherDashboard;
