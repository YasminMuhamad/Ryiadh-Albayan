import React from "react";
import { Download, Calendar, TrendingUp, Users, CheckCircle } from "lucide-react";
import "../../styles/globals.css";
import Sidebar from "../../components/TeacherSidebar.jsx"; // <-- استيراد Sidebar من الملف الخارجي

/* ---------------------- Utility ---------------------- */
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/* ---------------------- Card Components ---------------------- */
function Card({ className, children, ...props }) {
  return (
    <div className={cn("bg-card text-foreground rounded-xl border shadow-sm", className)} {...props}>
      {children}
    </div>
  );
}

function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn("p-4 border-b border-border", className)} {...props}>
      {children}
    </div>
  );
}

function CardContent({ className, children, ...props }) {
  return (
    <div className={cn("p-4", className)} {...props}>
      {children}
    </div>
  );
}

function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn("text-lg font-semibold", className)} {...props}>
      {children}
    </h3>
  );
}

/* ---------------------- Button ---------------------- */
function Button({ className, children, variant = "default", size = "md", ...props }) {
  let base = "inline-flex items-center justify-center rounded-md font-medium transition-colors";
  let variants = {
    default: "bg-primary text-white hover:bg-primary-hover",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
  };
  let sizes = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

/* ---------------------- Badge ---------------------- */
function Badge({ className, children, variant = "solid", ...props }) {
  const variants = {
    solid: "bg-green-500 text-white px-2 py-1 rounded",
    outline: "border border-red-500 text-red-500 px-2 py-1 rounded",
  };
  return (
    <span className={cn(variants[variant], className)} {...props}>
      {children}
    </span>
  );
}

/* ---------------------- Table Components ---------------------- */
function Table({ className, children }) {
  return <table className={cn("min-w-full divide-y divide-border", className)}>{children}</table>;
}

function TableHeader({ className, children }) {
  return <thead className={cn("bg-gray-50", className)}>{children}</thead>;
}

function TableBody({ className, children }) {
  return <tbody className={cn("bg-card divide-y divide-border", className)}>{children}</tbody>;
}

function TableRow({ className, children }) {
  return <tr className={cn("", className)}>{children}</tr>;
}

function TableHead({ className, children }) {
  return <th className={cn("px-4 py-2 text-left text-sm font-medium text-foreground", className)}>{children}</th>;
}

function TableCell({ className, children }) {
  return <td className={cn("px-4 py-2 text-sm text-foreground", className)}>{children}</td>;
}

/* ---------------------- Mock Data ---------------------- */
const mockStudents = [
  { id: 1, name: "Ali Ahmed", 
    
   },
  { id: 2, name: "Sara Mohamed",},
  { id: 3, name: "Omar Hossam",},
];

const mockLiveSessions = [
  { id: 1, title: "Math - Session 1", status: "Finished", dateTime: "2025-11-20T10:00" },
  { id: 2, title: "Physics - Session 2", status: "Finished", dateTime: "2025-11-22T12:00" },
  { id: 3, title: "Chemistry - Session 3", status: "Upcoming", dateTime: "2025-11-25T09:00" },
];

const uiStrings = {
  attendance: {
    reports: "Attendance Reports",
    exportAttendance: "Export Attendance",
    attendance: "Attendance",
  },
};

/* ---------------------- Reports Page ---------------------- */
export default function ReportsPage() {
  const finishedSessions = mockLiveSessions.filter((s) => s.status === "Finished");

  return (
    <div className="flex min-h-screen bg-[var(--background)]">

      {/* ---- SIDEBAR ---- */}
      <Sidebar />

      {/* ---- MAIN CONTENT ---- */}
      <div className="flex-1 space-y-6 p-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold mb-2">{uiStrings.attendance.reports}</h1>
            <p className="text-muted-foreground">Track attendance and generate reports</p>
          </div>
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            {uiStrings.attendance.exportAttendance}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Overall Attendance Card */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Overall Attendance</p>
                  <p className="text-2xl font-semibold">87%</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-success bg-opacity-20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sessions This Month Card */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Sessions This Month</p>
                  <p className="text-2xl font-semibold">{finishedSessions.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary bg-opacity-20 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Students Card */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Students</p>
                  <p className="text-2xl font-semibold">{mockStudents.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-secondary bg-opacity-40 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Perfect Attendance Card */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Perfect Attendance</p>
                  <p className="text-2xl font-semibold">12</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-success bg-opacity-20 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Table */}
        <Card>
          <CardHeader>
            <CardTitle>{uiStrings.attendance.attendance} Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Total Sessions</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Late</TableHead>
                    <TableHead>Attendance Rate</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockStudents.map((student) => {
                    const totalSessions = 10;
                    const present = Math.floor(Math.random() * 3) + 7;
                    const absent = totalSessions - present;
                    const rate = Math.round((present / totalSessions) * 100);

                    return (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm arabic-text">{student.nameArabic}</p>
                          </div>
                        </TableCell>
                        <TableCell>{totalSessions}</TableCell>
                        <TableCell>
                          <Badge className="bg-success text-white">{present}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{absent}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">0</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-accent rounded-full overflow-hidden">
                              <div className="h-full bg-success" style={{ width: `${rate}%` }} />
                            </div>
                            <span className="text-sm font-medium w-12">{rate}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Session-wise Attendance */}
        <Card>
          <CardHeader>
            <CardTitle>Session-wise Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {finishedSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{session.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(session.dateTime).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Present</p>
                      <p className="text-lg font-semibold text-success">{Math.floor(Math.random() * 10) + 35}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Absent</p>
                      <p className="text-lg font-semibold text-danger">{Math.floor(Math.random() * 5) + 1}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
