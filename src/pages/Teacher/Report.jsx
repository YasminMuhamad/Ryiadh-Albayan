// pages/Teacher/ReportsPage.jsx
import React, { useEffect, useState, useContext } from "react";
import { Download, Calendar, TrendingUp, Users, CheckCircle } from "lucide-react";
import "../../styles/globals.css";
import Sidebar from "../../components/TeacherSidebar.jsx";
import { getDatabase, ref, get, child } from "firebase/database";
import { app } from "../../../firebase.config";
import { TeacherContext } from "../../context/TeacherContext.jsx";

/* ---------------------- Utility ---------------------- */
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/* ---------------------- Card Components ---------------------- */
function Card({ className, children }) {
  return <div className={cn("bg-card text-foreground rounded-xl border shadow-sm", className)}>{children}</div>;
}
function CardContent({ className, children }) {
  return <div className={cn("p-4", className)}>{children}</div>;
}

/* ---------------------- Button & Badge ---------------------- */
function Button({ className, children, variant = "default", size = "md", ...props }) {
  let base = "inline-flex items-center justify-center rounded-md font-medium transition-colors";
  let variants = {
    default: "bg-primary text-white hover:bg-primary-hover",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
  };
  let sizes = { sm: "px-2 py-1 text-sm", md: "px-4 py-2 text-base", lg: "px-6 py-3 text-lg" };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
function Badge({ className, children, variant = "solid" }) {
  const variants = {
    solid: "bg-green-500 text-white px-2 py-1 rounded",
    outline: "border border-red-500 text-red-500 px-2 py-1 rounded",
  };
  return <span className={cn(variants[variant], className)}>{children}</span>;
}

/* ---------------------- Table ---------------------- */
function Table({ className, children }) {
  return <table className={cn("min-w-full divide-y divide-border", className)}>{children}</table>;
}
function TableHeader({ children }) { return <thead className="bg-gray-50">{children}</thead>; }
function TableBody({ children }) { return <tbody className="bg-card divide-y divide-border">{children}</tbody>; }
function TableRow({ children }) { return <tr>{children}</tr>; }
function TableHead({ children }) { return <th className="px-4 py-2 text-left text-sm font-medium text-foreground">{children}</th>; }
function TableCell({ children }) { return <td className="px-4 py-2 text-sm text-foreground">{children}</td>; }

/* ---------------------- Reports Page ---------------------- */
export default function ReportsPage() {
  const { teacher } = useContext(TeacherContext);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacher) return; // تأكد من وجود بيانات المدرس

    const db = getDatabase(app);
    const dbRef = ref(db);

    async function fetchData() {
      try {
        const snapshot = await get(child(dbRef, "users"));
        const sessionSnap = await get(child(dbRef, "liveSessions")); // تأكدي اسم الـ node في Firebase

        if (snapshot.exists() && sessionSnap.exists()) {
          const usersData = snapshot.val();
          const sessionsData = sessionSnap.val();

          // جلب الطلاب فقط
          const studentList = Object.values(usersData).filter((u) => u.role === "student");
          setStudents(studentList);

          // جلب الجلسات الخاصة بالمدرس
          const teacherSessions = Object.values(sessionsData).filter(s => s.teacherId === teacher.id);
          setSessions(teacherSessions);
        }

        setLoading(false);
      } catch (error) {
        console.error("Firebase fetch error:", error);
        setLoading(false);
      }
    }

    fetchData();
  }, [teacher]);

  if (loading || !teacher) return <div className="p-6">Loading...</div>;

  // -------------------- احصائيات --------------------
  const totalStudents = students.length;
  const totalSessions = sessions.length;

  let totalPresent = 0;
  let perfectAttendanceCount = 0;

  const attendanceData = students.map((student) => {
    let presentCount = 0;

    sessions.forEach((session) => {
      const enrollments = student.enrollments || {};
      const sessionProgress = Object.values(enrollments).find((e) => e.courseId === session.courseId);
      if (sessionProgress && sessionProgress.status === "completed") {
        presentCount++;
      }
    });

    if (presentCount === totalSessions) perfectAttendanceCount++;
    totalPresent += presentCount;

    return {
      ...student,
      presentCount,
      absentCount: totalSessions - presentCount,
      attendanceRate: totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0,
    };
  });

  const overallAttendance = totalSessions > 0 ? Math.round((totalPresent / (totalStudents * totalSessions)) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />

      <div className="flex-1 p-6 space-y-6">

        {/* Header */}
        <h1 className="text-3xl font-semibold mb-2">Attendance Reports</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-1">Overall Attendance</p>
              <p className="text-2xl font-semibold">{overallAttendance}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-1">Active Students</p>
              <p className="text-2xl font-semibold">{totalStudents}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-1">Perfect Attendance</p>
              <p className="text-2xl font-semibold">{perfectAttendanceCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-1">Sessions This Month</p>
              <p className="text-2xl font-semibold">{totalSessions}</p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Total Sessions</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Absent</TableHead>
                  <TableHead>Attendance Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData.map((s) => (
                  <TableRow key={s.uid}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{totalSessions}</TableCell>
                    <TableCell><Badge>{s.presentCount}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{s.absentCount}</Badge></TableCell>
                    <TableCell>{s.attendanceRate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

      </div>
    </div>
  );
}
