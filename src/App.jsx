import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import Home from "../src/pages/Home/Home.jsx";
import Courses from "../src/pages/Courses/Courses.jsx";
import { Footer } from "./components/Footer.jsx";
import CourseDetails from "../src/pages/Courses/CourseDetails.jsx";
import Contact from "../src/pages/Contact/Contact.jsx";
import Login from "../src/pages/Auth/Login.jsx";
import Register from "../src/pages/Auth/RegisterStudent.jsx";
import Cart from "../src/pages/Cart/Cart.jsx";
import Checkout from "../src/pages/Checkout/Checkout.jsx";
import PaymentSuccess from "../src/pages/Checkout/PaymentSuccess.jsx";

import ProtectedRoute from "../src/router.jsx";
import { AuthProvider, useAuth } from "../src/context/AuthContext.jsx";

import './styles/globals.css';
import { AdminShell } from "./components/AdminShell.jsx";
import { TeacherDashboard } from "./pages/Teacher/Dashboard.jsx";
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
        </Layout>
      </Router>
    </AuthProvider>
  );
}
