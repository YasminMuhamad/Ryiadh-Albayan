import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Users, Video, BookOpen, Plus, FileQuestion, Calendar } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import "../../styles/globals.css";

import Sidebar from "../../components/TeacherSidebar.jsx";

const TeacherDashboard = ({ teacherId: propTeacherId }) => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const teacherId = propTeacherId || profile?.uid;

  const [courses, setCourses] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);

  // ======= Mock Data =======
  const recentActivities = [
    { id: 1, type: "session", title: "Live Session Scheduled", description: "A new live session on 'Arabic Alphabet Basics' has been scheduled.", timestamp: Date.now() - 2*60*60*1000 },
    { id: 2, type: "quiz", title: "Quiz Added", description: "A new quiz was added to 'Basic Grammar' course.", timestamp: Date.now() - 5*60*60*1000 },
    { id: 3, type: "lesson", title: "New Lesson Uploaded", description: "Lesson 'Introduction to Tajweed' has been uploaded.", timestamp: Date.now() - 1*24*60*60*1000 },
  ];

  const quickActions = [
    { action:"createCourse", icon: BookOpen, title:"Create Course", desc:"Start a new course" },
    { action:"addAnnouncement", icon: Calendar, title:"Add Announcement", desc:"Post to your courses" },
    { action:"addQuiz", icon: FileQuestion, title:"Add Quiz", desc:"Create an assessment" },
  ];

  const upcomingSessions = [
    { id:1, title:"Introduction to Arabic Alphabet", time:"Today 4:00 PM", duration:"60 min", badge:"In 2 hours" },
    { id:2, title:"Fiqh Discussion - Prayer Rulings", time:"Tomorrow 2:00 PM", duration:"90 min", badge:"Tomorrow" },
  ];

  const formatTime = (timestamp) => {
    const diff = Math.floor((Date.now() - timestamp)/(1000*60*60));
    if(diff<1) return "Just now";
    if(diff<24) return `${diff}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  useEffect(() => {
    if (!teacherId) return;

    const getTeacherCourses = async () => {
      try {
        const q = query(
          collection(db, "courses"),
          where("teacherId", "==", teacherId)
        );

        const querySnapshot = await getDocs(q);

        const coursesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(coursesData);

        const total = coursesData.reduce(
          (sum, course) => sum + (course.studentsCount || 0),
          0
        );
        setTotalStudents(total);
      } catch (error) {
        console.error("Error getting courses:", error);
      }
    };

    getTeacherCourses();
  }, [teacherId]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 bg-[var(--background)] p-6 space-y-6 font-[Poppins]">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold mb-2 text-[var(--foreground)]">
              Welcome Back, {profile?.name || "Teacher"}
            </h1>
            <p className="text-[var(--foreground)]/70 text-sm">
              Here's what's happening with your courses today
            </p>
          </div>

          <div className="flex gap-2">
            <button
              className="bg-[var(--primary)] text-white px-4 py-2 rounded-[var(--radius)] flex items-center gap-2 hover:opacity-90"
              onClick={() => navigate("/Teacher/AddQuize")}
            >
              <Plus className="w-5 h-5" /> Add Quiz
            </button>

            <button
              className="bg-[var(--primary)] text-white px-4 py-2 rounded-[var(--radius)] flex items-center gap-2 hover:opacity-90"
              onClick={() => navigate("/Teacher/AddLiveSessions")}
            >
              <Plus className="w-5 h-5" /> Add Live Session
            </button>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Students */}
          <div className="bg-white border border-[var(--primary)] p-4 rounded-[var(--radius)] flex items-center justify-between cursor-pointer hover:bg-[var(--secondary)] transition">
            <div className="flex items-center gap-3">
              <div className="bg-[var(--primary)] p-2 rounded flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-lg text-[var(--foreground)]">
                  {totalStudents}
                </p>
                <p className="text-sm text-[var(--foreground)]/70">
                  Total Students
                </p>
              </div>
            </div>
          </div>

          {/* Total Interactive Courses */}
          <div className="bg-white border border-[var(--primary)] p-4 rounded-[var(--radius)] flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-[var(--primary)] p-2 rounded flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-lg text-[var(--foreground)]">
                  {courses.filter((course) => course.type === "interactive").length}
                </p>
                <p className="text-sm text-[var(--foreground)]/70">
                  Total Interactive Courses
                </p>
              </div>
            </div>
          </div>

          {/* Total Recorded Courses */}
          <div className="bg-white border border-[var(--primary)] p-4 rounded-[var(--radius)] flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-[var(--primary)] p-2 rounded flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-lg text-[var(--foreground)]">
                  {courses.filter((course) => course.type === "recorded").length}
                </p>
                <p className="text-sm text-[var(--foreground)]/70">
                  Total Recorded Courses
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RECENT + ACTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-semibold mb-3 text-[var(--primary)]">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 p-3 bg-[var(--card)] rounded-[var(--radius)] hover:bg-[var(--secondary)] cursor-pointer"
                >
                  <div className="w-10 h-10 bg-[var(--secondary)] rounded-full flex items-center justify-center">
                    {act.type === "quiz" ? (
                      <FileQuestion className="w-5 h-5 text-[var(--primary)]" />
                    ) : act.type === "lesson" ? (
                      <BookOpen className="w-5 h-5 text-[var(--primary)]" />
                    ) : (
                      <Calendar className="w-5 h-5 text-[var(--primary)]" />
                    )}
                  </div>

                  <div>
                    <p className="font-medium text-[var(--foreground)]">{act.title}</p>
                    <p className="text-[var(--foreground)]/60 text-sm">{act.description}</p>
                    <p className="text-[var(--foreground)]/40 text-xs mt-1">
                      {formatTime(act.timestamp)}
                    </p>
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
                <button
                  key={a.action}
                  onClick={() => navigate(`/Teacher/AddQuize`)}
                  className="flex items-center gap-3 p-3 bg-[var(--card)] rounded-[var(--radius)] hover:bg-[var(--secondary)]"
                >
                  <div className="w-10 h-10 bg-[var(--primary)] text-white flex items-center justify-center rounded-[var(--radius)]">
                    <a.icon className="w-5 h-5" />
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
              <div
                key={session.id}
                className="flex items-center justify-between p-3 bg-[var(--card)] rounded-[var(--radius)] hover:bg-[var(--secondary)]"
              >
                <div className="flex items-center gap-3">
                  <Video className="w-6 h-6 text-[var(--primary)]" />
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{session.title}</p>
                    <p className="text-[var(--foreground)]/60 text-sm">
                      {session.time} • {session.duration}
                    </p>
                  </div>
                </div>
                <div className="bg-[var(--secondary)] px-2 py-1 rounded text-sm">
                  {session.badge}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherDashboard;
