import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  BookOpen,
  Video,
  FileQuestion,
  Bell,
  Calendar,
} from "lucide-react";
import "../../styles/globals.css";

// Firebase
import { db } from "../../../firebase.config";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

// Context
import { TeacherContext } from "../../context/TeacherContext.jsx";

// Sidebar
import Sidebar from "../../components/TeacherSidebar.jsx";
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
  const teacherId = teacher?.id; // افترض ان الـ context فيه id

  // ===== STATES =====
  const [coursesCount, setCoursesCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [liveSessionsCount, setLiveSessionsCount] = useState(0);
  const [quizzesCount, setQuizzesCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);

  // ===== TIME FORMAT =====
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const diff = Math.floor((Date.now() - timestamp.toDate()) / (1000 * 60 * 60));
    if (diff < 1) return "Just now";
    if (diff < 24) return `${diff}h ago`;
    return timestamp.toDate().toLocaleDateString();
  };

  // ===== FETCH FIREBASE DATA =====
  useEffect(() => {
    if (!teacherId) return;

    // Courses count
    const coursesQuery = query(
      collection(db, "courses"),
      where("teacherId", "==", teacherId)
    );
    getDocs(coursesQuery).then((snap) => {
      setCoursesCount(snap.size);
    });

    // Students count
    getDocs(collection(db, "students")).then((snap) => {
      setStudentsCount(snap.size);
    });

    // Live sessions
    getDocs(collection(db, "liveSessions")).then((snap) => {
      setLiveSessionsCount(snap.size);
    });

    // Quizzes
    getDocs(collection(db, "quizzes")).then((snap) => {
      setQuizzesCount(snap.size);
    });

    // Recent Activity
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
      setUpcomingSessions(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });

    return () => {
      unsubActivity();
      unsubSessions();
    };
  }, [teacherId]);

  if (!teacher) return <div className="p-6">Loading...</div>;

  // KPI DATA
  const kpiData = [
    { title: "My Courses", value: coursesCount, icon: BookOpen, trend: "+3%", link: "/teacher/courses" },
    { title: "Students", value: studentsCount, icon: Users, trend: "+5%", link: "/teacher/students" },
    { title: "Live Sessions", value: liveSessionsCount, icon: Video, trend: "+2%", link: "/teacher/live" },
    { title: "Quizzes", value: quizzesCount, icon: FileQuestion, trend: "+1%", link: "/teacher/assignment" },
  ];

  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 space-y-6 font-[Poppins]">

        {/* HEADER */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={teacher.profile_pic}
              alt={teacher.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-[var(--primary)]"
            />
            <div>
              <h1 className="text-3xl font-semibold text-[var(--foreground)]">
                Welcome Back, {teacher.name_ar} 👋
              </h1>
              <p className="text-[var(--foreground)]/70 text-sm">{teacher.specialization}</p>
              <p className="text-[var(--foreground)]/60 text-xs">
                Joined: {new Date(teacher.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map((kpi) => (
            <KPICard key={kpi.title} {...kpi} onClick={() => navigate(kpi.link)} />
          ))}
        </div>

        {/* باقي المحتوى زي Recent Activity وQuick Actions وUpcoming Sessions */}
      </div>
    </div>
  );
};

export default TeacherDashboard;
