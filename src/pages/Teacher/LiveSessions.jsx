// pages/Teacher/LiveSessionsPage.jsx
import React, { useEffect, useState, useContext } from "react";
import Sidebar from "../../components/TeacherSidebar.jsx";
import { getDatabase, ref, get, child } from "firebase/database";
import { app } from "../../../firebase.config";
import { Calendar, Clock, Play, Plus } from "lucide-react";
import { TeacherContext } from "../../context/TeacherContext.jsx";

// ---------------- Button ----------------
function Button({ variant = "default", size = "md", children, ...props }) {
  const base = "rounded-md font-medium transition-all flex items-center justify-center";
  const variants = {
    default: "bg-[var(--primary)] text-white hover:opacity-90",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
  };
  const sizes = { sm: "px-2 py-1 text-sm", md: "px-4 py-2 text-md" };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]}`} {...props}>
      {children}
    </button>
  );
}

// ---------------- Badge ----------------
function Badge({ children, className = "" }) {
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>{children}</span>;
}

// ---------------- Card ----------------
function Card({ children, className = "" }) {
  return <div className={`bg-[var(--card)] rounded-[var(--radius)] shadow-md p-4 ${className}`}>{children}</div>;
}

// ---------------- Page ----------------
export default function LiveSessionsPage() {
  const { teacher } = useContext(TeacherContext); // استخدام Context
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("upcoming");

  useEffect(() => {
    if (!teacher) return; // تأكد من وجود بيانات المدرس قبل fetch

    const db = getDatabase(app);
    const dbRef = ref(db);

    async function fetchSessions() {
      try {
        const snapshot = await get(child(dbRef, "live_sessions"));
        if (snapshot.exists()) {
          const data = snapshot.val();
          const sessionList = Object.values(data).filter(s => s.teacherId === teacher.id); // تصفية الجلسات حسب المدرس
          setSessions(sessionList);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }

    fetchSessions();
  }, [teacher]);

  const now = new Date();

  const upcomingSessions = sessions.filter(s => new Date(s.date) > now);
  const liveSessions = sessions.filter(s => {
    const start = new Date(s.date);
    const end = new Date(start.getTime() + s.duration * 60000);
    return start <= now && now <= end;
  });
  const finishedSessions = sessions.filter(s => new Date(s.date) < now && !liveSessions.includes(s));

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const renderSessionCard = (session) => {
    let attendanceText = null;
    if (finishedSessions.includes(session)) {
      const present = Math.floor(Math.random() * 10) + 1;
      const absent = Math.floor(Math.random() * 5);
      attendanceText = (
        <div className="flex gap-4 mt-2">
          <span>Present: {present}</span>
          <span>Absent: {absent}</span>
        </div>
      );
    }

    return (
      <Card key={session.sessionId} className="hover:shadow-lg transition">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{session.title}</h3>
            <div className="flex gap-4 mt-2 text-sm text-[var(--foreground)]">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDateTime(session.date)}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {session.duration} mins</span>
            </div>
            {attendanceText}
          </div>

          <div className="flex flex-col gap-2">
            {(upcomingSessions.includes(session) || liveSessions.includes(session)) && (
              <Button className="flex items-center gap-2">
                <Play className="w-4 h-4" /> Join Session
              </Button>
            )}
            {finishedSessions.includes(session) && <Button variant="outline" size="sm">View Attendance</Button>}
          </div>
        </div>
      </Card>
    );
  };

  if (loading || !teacher) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="flex-1 p-6 flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="heading-1">Live Sessions</h1>
            <p className="paragraph">Manage your live teaching sessions</p>
          </div>
          <Button className="flex items-center gap-2"><Plus className="w-4 h-4" /> Schedule New</Button>
        </div>

        <div>
          <div className="flex border-b border-[var(--border)]">
            <button onClick={() => setView("upcoming")} className={`px-4 py-2 ${view === "upcoming" ? "border-b-2 border-[var(--primary)] font-semibold" : ""}`}>
              Upcoming ({upcomingSessions.length})
            </button>
            <button onClick={() => setView("live")} className={`px-4 py-2 ${view === "live" ? "border-b-2 border-[var(--primary)] font-semibold" : ""}`}>
              Live Now ({liveSessions.length})
            </button>
            <button onClick={() => setView("finished")} className={`px-4 py-2 ${view === "finished" ? "border-b-2 border-[var(--primary)] font-semibold" : ""}`}>
              Finished ({finishedSessions.length})
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {view === "upcoming" && upcomingSessions.map(renderSessionCard)}
            {view === "live" && liveSessions.map(renderSessionCard)}
            {view === "finished" && finishedSessions.map(renderSessionCard)}
          </div>
        </div>
      </div>
    </div>
  );
}
