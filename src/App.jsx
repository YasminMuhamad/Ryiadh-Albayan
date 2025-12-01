import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import Home from "../src/pages/Home/Home.jsx";
import Courses from "../src/pages/Courses/Courses.jsx";
import { Footer } from "./components/Footer.jsx";
import CourseDetails from "../src/pages/Courses/CourseDetails.jsx";
import Contact from "../src/pages/Contact/Contact.jsx";
import './styles/globals.css'; 
import { TeacherProvider } from "./context/TeacherContext.jsx";
import TeacherDashboard from "./pages/Teacher/TeacherDashboard.jsx";
import LiveSessions from "./pages/Teacher/LiveSessions";
import Profile from "./pages/Teacher/Profile";
import Report from "./pages/Teacher/Report.jsx";
import Students from "./pages/Teacher/Students.jsx";
import Assignment from "./pages/Teacher/Assignment.jsx";
import AddQuizepage from "./pages/Teacher/AddQuize.jsx";
import { AdminShell } from "./components/AdminShell.jsx";
import Login from "../src/pages/Auth/Login.jsx";
import Register from "../src/pages/Auth/RegisterStudent.jsx";
import ProtectedRoute from "../src/router.jsx";
import { AuthProvider, useAuth } from "../src/context/AuthContext.jsx";
import StudentDashboard from "./pages/Student/Dashboard.jsx";

// -------------------------
// Layout Component
// -------------------------
function Layout({ children }) {
  const location = useLocation();

  // لو الصفحة من نوع admin → نخفي Footer فقط
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
      <Navbar />

      <div className="pt-16">
        {children}
      </div>

      {!isAdminPage && <Footer />}
    </>
  );
}

// Wrapper Component داخل App.jsx
function StudentDashboardWithUid() {
  const { profile, uid, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!profile || !uid) return <div>Unauthorized</div>;

  return <StudentDashboard userId={uid} />; // نمرر uid مباشرة
}

export default function App() {

  return (
    <Router>
      <Navbar />
      <div className="pt-16">
        <TeacherProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/report" element={<Report />} />
          <Route path="/teacher/live" element={<LiveSessions />} />
          <Route path="/teacher/students" element={<Students />} />
          <Route path="/teacher/profile" element={<Profile />} />
          <Route path="/teacher/Assignment" element={<Assignment />} />
          <Route path="/teacher/AddQuize" element={<AddQuizepage/>}/>
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/admin" element={<AdminShell />} />
            <Route path="/register" element={<Register />} />

            {/* صفحة الأدمن */}
            <Route path="/admin/*" element={<AdminShell />} />

            {/* صفحة الطالب محمية */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute role="student">
                  <StudentDashboardWithUid />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute role="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
        </Routes>
        </TeacherProvider>
      </div>
      <Footer />
    </Router>
  );
}

  //   <AuthProvider>
  //     <Router>
  //       <Layout>
  //         <Routes>
  //           <Route path="/" element={<Home />} />
  //           <Route path="/courses" element={<Courses />} />
  //           <Route path="/contact" element={<Contact />} />
  //           <Route path="/login" element={<Login />} />
  //           <Route path="/courses/:id" element={<CourseDetails />} />
  //           <Route path="/register" element={<Register />} />

  //           {/* صفحة الأدمن */}
  //           <Route path="/admin/*" element={<AdminShell />} />

  //           {/* صفحة الطالب محمية */}
  //           <Route
  //             path="/student/dashboard"
  //             element={
  //               <ProtectedRoute role="student">
  //                 <StudentDashboardWithUid />
  //               </ProtectedRoute>
  //             }
  //           />
  //           <Route
  //             path="/teacher/dashboard"
  //             element={
  //               <ProtectedRoute role="teacher">
  //                 <TeacherDashboard />
  //               </ProtectedRoute>
  //             }
  //           />
  //         </Routes>
  //       </Layout>
  //     </Router>
  //   </AuthProvider>
  // );
// }
