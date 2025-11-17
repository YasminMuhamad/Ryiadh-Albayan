import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "../src/pages/Home/Home.jsx";
import Courses from "../src/pages/Courses/Courses.jsx";
import Contact from "../src/pages/Contact/Contact.jsx";
import './styles/globals.css'; 
import { Dashboard } from "./pages/Admin/Dashboard.jsx";
import TeacherDashboard from "./pages/Teacher/TeacherDashboard.jsx";
import TeacherCourses from "./pages/Teacher/TeacherCourses";
import LiveSessions from "./pages/Teacher/LiveSessions";
import Profile from "./pages/Teacher/Profile";

export default function App() {
  return (
    <Router>
      <Navbar />
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/TeacherCourses" element={<Courses />} />
          <Route path="/teacher/live" element={<LiveSessions />} />
          <Route path="/teacher/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}