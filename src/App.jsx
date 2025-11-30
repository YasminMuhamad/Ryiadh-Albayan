import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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
import { AdminShell } from "./components/AdminShell.jsx";
import { Navbar } from "./components/Navbar.jsx";


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
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/admin" element={<AdminShell />} />
        </Routes>
        </TeacherProvider>
      </div>
      <Footer />
    </Router>
  );
}