import React, { useState } from "react";
import { Video, Calendar, Clock, Plus, Play } from "lucide-react";
import "../../styles/globals.css";
import Sidebar from "../../components/TeacherSidebar.jsx"; // ← استدعاء السايد بار

// ---------------- Button ----------------
function Button({ variant = "default", size = "md", children, ...props }) {
  const base = "rounded-md font-medium transition-all flex items-center justify-center";
  const variants = {
    default: "bg-[var(--primary)] text-white hover:opacity-90",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
  };
  const sizes = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2 text-md",
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]}`} {...props}>
      {children}
    </button>
  );
}

// ---------------- Badge ----------------
function Badge({ children, className = "" }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>{children}</span>
  );
}

// ---------------- Card ----------------
function Card({ children, className = "" }) {
  return (
    <div className={`bg-[var(--card)] rounded-[var(--radius)] shadow-md p-4 ${className}`}>
      {children}
    </div>
  );
}

// ---------------- MOCK DATA ----------------
const mockLiveSessions = [
  {
    id: "1",
    title: "Math Live Class",
    dateTime: new Date(Date.now() + 3600 * 1000).toISOString(),
    duration: 60,
    status: "Upcoming",
  },
  {
    id: "2",
    title: "Science Live Class",
    dateTime: new Date(Date.now() - 1800 * 1000).toISOString(),
    duration: 45,
    status: "Live",
  },
  {
    id: "3",
    title: "History Recorded Class",
    dateTime: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    duration: 50,
    status: "Finished",
    attendanceMarked: true,
  },
];

const uiStrings = {
  liveSession: {
    liveSessions: "Live Sessions",
    scheduleNew: "Schedule New",
    minutes: "minutes",
  },
};

export default function LiveSessionsPage() {
  const [view, setView] = useState("upcoming");

  const upcomingSessions = mockLiveSessions.filter((s) => s.status === "Upcoming");
  const liveSessions = mockLiveSessions.filter((s) => s.status === "Live");
  const finishedSessions = mockLiveSessions.filter((s) => s.status === "Finished");

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderSessionCard = (session) => (
    <Card key={session.id} className="hover:shadow-lg transition">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{session.title}</h3>
          <p className="arabic-text">{session.courseTitleArabic}</p>

          <div className="flex gap-4 mt-2 text-sm text-[var(--foreground)]">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> {formatDateTime(session.dateTime)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {session.duration} {uiStrings.liveSession.minutes}
            </span>
          </div>

          <div className="mt-2">
            {session.status === "Upcoming" && (
              <Badge className="bg-[var(--secondary)] text-[var(--foreground)]">Upcoming</Badge>
            )}
            {session.status === "Live" && (
              <Badge className="bg-red-500 text-white animate-pulse">Live Now</Badge>
            )}
            {session.status === "Finished" && (
              <Badge className="bg-gray-200 text-gray-700">Finished</Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {(session.status === "Live" || session.status === "Upcoming") && (
            <Button className="flex items-center gap-2">
              <Play className="w-4 h-4" /> Join Session
            </Button>
          )}
          {session.status === "Finished" && (
            <Button variant="outline" size="sm">
              View Attendance
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="flex min-h-screen bg-[var(--background)]">

      {/* ---- SIDEBAR ---- */}
      <Sidebar />

      {/* ---- MAIN CONTENT ---- */}
      <div className="flex-1 p-6 flex flex-col space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="heading-1">{uiStrings.liveSession.liveSessions}</h1>
            <p className="paragraph">Manage your live teaching sessions</p>
          </div>

          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> {uiStrings.liveSession.scheduleNew}
          </Button>
        </div>

        {/* Tabs */}
        <div>
          <div className="flex border-b border-[var(--border)]">
            <button
              onClick={() => setView("upcoming")}
              className={`px-4 py-2 ${view === "upcoming" ? "border-b-2 border-[var(--primary)] font-semibold" : ""}`}
            >
              Upcoming ({upcomingSessions.length})
            </button>

            <button
              onClick={() => setView("live")}
              className={`px-4 py-2 ${view === "live" ? "border-b-2 border-[var(--primary)] font-semibold" : ""}`}
            >
              Live Now ({liveSessions.length})
            </button>

            <button
              onClick={() => setView("finished")}
              className={`px-4 py-2 ${view === "finished" ? "border-b-2 border-[var(--primary)] font-semibold" : ""}`}
            >
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
