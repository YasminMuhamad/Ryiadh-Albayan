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

import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";

import './styles/globals.css';
import { AdminShell } from "./components/AdminShell";
import { TeacherDashboard } from "./pages/Teacher/Dashboard";
import StudentDashboard from "./pages/Student/Dashboard";
import Loader from "./components/Loader";
import StudentProfile from "./pages/Student/Profile";
import TeacherProfile from "./pages/Teacher/Profile";
import AdminProfile from "./pages/Admin/AdminProfile";
import NotFound from "./pages/Auth/NotFound.jsx";

// -------------------------
// Layout Component
// -------------------------
function Layout({ children }) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");
  const isTeacherPage = location.pathname.startsWith("/teacher");

  return (
    <>
      <Navbar />
      <div className="pt-16">{children}</div>
      {!isAdminPage && !isTeacherPage && <Footer />}
    </>
  );
}

function StudentDashboardWithUid() {
  const { profile, uid, loading } = useAuth();

  if (loading) return <Loader />;
  if (!profile || !uid) return <div>Unauthorized</div>;

  return <StudentDashboard userId={uid} />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout/:id" element={<Checkout />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="*" element={<NotFound />} />

            {/* Admin Pages */}
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

            {/* Student Pages */}
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

            {/* Teacher Pages */}
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute role="teacher">
                  <TeacherDashboard />
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

          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}