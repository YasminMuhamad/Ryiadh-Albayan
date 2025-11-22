import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import Home from "../src/pages/Home/Home.jsx";
import Courses from "../src/pages/Courses/Courses.jsx";
import { Footer } from "./components/Footer.jsx";
import CourseDetails from "../src/pages/Courses/CourseDetails.jsx";
import Contact from "../src/pages/Contact/Contact.jsx";
import Login from "../src/pages/Auth/Login.jsx";
import Register from "../src/pages/Auth/RegisterStudent.jsx";
import StudentProfile from "../src/pages/Student/Profile.jsx";

import ProtectedRoute from "../src/router.jsx";
import { AuthProvider } from "../src/context/AuthContext.jsx";

import './styles/globals.css'; 
import { AdminShell } from "./components/AdminShell.jsx";


export default function App() {
  return (
    <AuthProvider>
      <Router>
         
        <Navbar />
        <div className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

            {/* صفحة الطالب محمية */}
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute role="student">
                  <StudentProfile />
                </ProtectedRoute>
              }
            />
            
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
