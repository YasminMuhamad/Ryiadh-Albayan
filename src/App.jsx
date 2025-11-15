import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import Home from "../src/pages/Home/Home.jsx";
import Courses from "../src/pages/Courses/Courses.jsx";
import Contact from "../src/pages/Contact/Contact.jsx";
import Login from "../src/pages/Auth/Login.jsx";
import Register from "../src/pages/Auth/RegisterStudent.jsx";
import StudentProfile from "../src/pages/Student/Profile.jsx";
import './styles/globals.css'; 

export default function App() {
  return (
    <Router>
      <Navbar />
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/student/profile" element={<StudentProfile/>} />
        </Routes>
      </div>
    </Router>
  );
}