import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import Home from "./pages/Home/Home";
import Courses from "./pages/Courses/Courses";
import { Footer } from "./components/Footer";
import CourseDetails from "./pages/Courses/CourseDetails";
import Contact from "./pages/Contact/Contact";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/RegisterStudent";
import Cart from "../src/pages/Cart/Cart.jsx";
import Checkout from "../src/pages/Checkout/Checkout.jsx";
import PaymentSuccess from "../src/pages/Checkout/PaymentSuccess.jsx";
import MyCourses from "./pages/Student/MyCourses.jsx";
import AddQuizPage from "./pages/Teacher/AddQuize.jsx";
import AddLiveSession from "./pages/Teacher/AddLiveSessions.jsx";
// import ReportsPage from "./pages/Teacher/Report.jsx";
// import students from "./pages/Teacher/Students.jsx";
import LiveSessions from "./pages/Teacher/LiveSessions.jsx";
import StudentsPage from "./pages/Teacher/Students.jsx";
// import AssignmentsPage from "./pages/Teacher/Assignments.jsx";
import InstructorsPage from "../src/pages/Instructor/Instructor.jsx";
import InstructorsDetails from "../src/pages/Instructor/InstructorDetails.jsx";

// import ProtectedRoute from "";
import { AuthProvider, useAuth } from "../src/context/AuthContext.jsx";

import './styles/globals.css';
import { AdminShell } from "./components/AdminShell";
import TeacherDashboard from "./pages/Teacher/TeacherDashboard.jsx";
import StudentDashboard from "./pages/Student/Dashboard";
import Loader from "./components/Loader";
import StudentProfile from "./pages/Student/Profile";
import TeacherProfile from "./pages/Teacher/Profile";
import AdminProfile from "./pages/Admin/AdminProfile";
import NotFound from "./pages/Auth/NotFound";
import ChatWidget from "./components/Chat";
import AboutUs from "./pages/AboutUs";

// import { addNotification } from "./services/notificationService";
import ResetPassword from "./pages/Auth/ResetPassword.jsx";
import ForgotPassword from "./pages/Auth/ForgotPassword.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import EditCourseFull from "./pages/Teacher/EditCourse.jsx";
import TeachersCoursesStyled from "./pages/Teacher/TeachersCourses.jsx";

// -------------------------
// Layout Component
// -------------------------
function Layout({ children }) {
  const location = useLocation();

  const isAdminPage = location.pathname.startsWith("/admin");
  const isTeacherPage = location.pathname.startsWith("/teacher");

  // Show ChatWidget only for students & guests
  const showChat = !isAdminPage && !isTeacherPage;


  // Send notification once
  //  addNotification({ 
  //    title: "App Started",
  //    message: " Test notification.",
  //   type: "info",
  //  });


  return (
    <>
      <Navbar />
      <div className="pt-16">{children}</div>

      {/* Chat Widget */}
      {showChat && <ChatWidget />}

      {/* Footer يظهر فقط للطالب والضيوف */}
      {!isAdminPage && !isTeacherPage && <Footer />}
    </>
  );
}

// -------------------------
// Student Dashboard Loader
// -------------------------
function StudentDashboardWithUid() {
  const { profile, uid, loading } = useAuth();

  if (loading) return <Loader />;
  if (!profile || !uid) return <div>Unauthorized</div>;

  return <StudentDashboard userId={uid} />;
}

// ---------------- Teacher Wrappers ----------------
export const TeacherDashboardWithUid = () => {
  const { uid, profile, loading } = useAuth();
  if (loading) return <Loader />;
  if (!profile || !uid) return <div>Unauthorized</div>;

  return <TeacherDashboard teacherId={uid} />;
};

export const MyCoursesWithUid = () => {
  const { uid, profile, loading } = useAuth();
  if (loading) return <Loader />;
  if (!profile || !uid) return <div>Unauthorized</div>;

  return <TeachersCoursesStyled teacherId={uid} />;
};

export const LiveSessionsWithUid = () => {
  const { uid, profile, loading } = useAuth();
  if (loading) return <Loader />;
  if (!profile || !uid) return <div>Unauthorized</div>;

  return <LiveSessions teacherId={uid} />;
};

export const AddQuizWithUid = () => {
  const { uid, profile, loading } = useAuth();
  if (loading) return <Loader />;
  if (!profile || !uid) return <div>Unauthorized</div>;

  return <AddQuizPage teacherId={uid} />;
};

export const AddLiveSessionWithUid = () => {
  const { uid, profile, loading } = useAuth();
  if (loading) return <Loader />;
  if (!profile || !uid) return <div>Unauthorized</div>;

  return <AddLiveSession teacherId={uid} />;
};

// export const ReportsWithUid = () => {
//   const { uid, profile, loading } = useAuth();
//   if (loading) return <Loader />;
//   if (!profile || !uid) return <div>Unauthorized</div>;

//   return <ReportsPage teacherId={uid} />;
// };

export const StudentsWithUid = () => {
  const { uid, profile, loading } = useAuth();
  if (loading) return <Loader />;
  if (!profile || !uid) return <div>Unauthorized</div>;

  return <StudentsPage teacherId={uid} />;
};

// export const AssignmentsWithUid = () => {
//   const { uid, profile, loading } = useAuth();
//   if (loading) return <Loader />;
//   if (!profile || !uid) return <div>Unauthorized</div>;

//   return <AssignmentsPage teacherId={uid} />;
// };

export const TeacherProfileWithUid = () => {
  const { uid, profile, loading } = useAuth();
  if (loading) return <Loader />;
  if (!profile || !uid) return <div>Unauthorized</div>;

  return <TeacherProfile teacherId={uid} />;
};

// -------------------------
// MAIN APP
// -------------------------
export default function App() {

  // -------------------------
  // Protection Layer for Entire Application
  // -------------------------
  useEffect(() => {
    document.addEventListener("contextmenu", (e) => e.preventDefault());

    document.addEventListener("keydown", (e) => {
      if (
        (e.ctrlKey &&
          ["c", "s", "u", "p"].includes(e.key.toLowerCase())) ||
        e.key === "PrintScreen"
      ) {
        e.preventDefault();
      }

      // Prevent Dev Tools
      if (e.key === "F12") e.preventDefault();
      if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === "I") e.preventDefault();
      if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === "J") e.preventDefault();
    });

    document.addEventListener("keyup", async (e) => {
      if (e.key === "PrintScreen") {
        await navigator.clipboard.writeText("");
        alert("Screenshot disabled!");
      }
    });
  }, []);


  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public pages */}
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/Instructors" element={<InstructorsPage />} />
            <Route path="/Instructors/:id" element={<InstructorsDetails />} />
            {/* E-commerce */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout/:id" element={<Checkout />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/my-courses" element={<MyCourses />} />

            {/* Admin */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute role="admin">
                  <AdminShell />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute role="admin">
                  <AdminProfile />
                </ProtectedRoute>
              }
            />

            {/* Student */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute role="student">
                  <StudentDashboardWithUid />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/profile"
              element={
                <ProtectedRoute role="student">
                  <StudentProfile />
                </ProtectedRoute>
              }
            />


            {/* Teacher */}
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute role="teacher">

                  <TeacherDashboardWithUid />

                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/profile"
              element={
                <ProtectedRoute role="teacher">
                  <TeacherProfile />

                </ProtectedRoute>
              }
            />


            <Route
              path="/teacher/MyCourses"
              element={
                <ProtectedRoute role="teacher">
                  <MyCoursesWithUid />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/live"
              element={
                <ProtectedRoute role="teacher">
                  <LiveSessionsWithUid />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/AddQuize"
              element={
                <ProtectedRoute role="teacher">
                  <AddQuizWithUid />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/AddLiveSessions"
              element={
                <ProtectedRoute role="teacher">
                  <AddLiveSessionWithUid />
                </ProtectedRoute>
              }
            />

            {/* <Route
              path="/teacher/report"
              element={
                <ProtectedRoute role="teacher">
                  <ReportsWithUid />
                </ProtectedRoute>
              }
            /> */}

            <Route
              path="/teacher/students"
              element={
                <ProtectedRoute role="teacher">
                  <StudentsWithUid />
                </ProtectedRoute>
              }
            />

            {/* <Route
              path="/teacher/assignments"
              element={
                <ProtectedRoute role="teacher">
                  <AssignmentsWithUid />
                </ProtectedRoute>
              }
            /> */}

            <Route
              path="/teacher/profile"
              element={
                <ProtectedRoute role="teacher">
                  <TeacherProfileWithUid />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/edit-course/:courseId"
              element={
                <ProtectedRoute role="teacher">
                  <EditCourseFull />
                </ProtectedRoute>
              }
            />

            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
