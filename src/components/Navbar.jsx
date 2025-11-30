import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, UserCircle, LogOut } from "lucide-react";
import { Button } from "./Button";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };
  const { user, logout } = useAuth();

  const currentPage = location.pathname;

  return (
    <nav className="navbar">
      <div className="navbar-content">

        <div className="logo-section">

          <div className="flex items-center justify-center">
            {/* <div className="logo"> */}
              <div
                className="w-12 h-12 flex items-center justify-center rounded-full"
                style={{ backgroundColor: '#E6EFEB' }}
              >
                <BookOpen className="text-2xl" style={{ color: '#0E7C7B' }} />
              </div>
            {/* </div> */}
            <div className="logo-text">
              <span
                onClick={() => handleNavigation('/')}
                className="logo-link"
              >
                Riyad Al-Bayan
              </span>
              <p className="subtitle">Arabic & Islamic Studies</p>
            </div>
          </div>
        </div>

        <div className="nav-links">
          <span onClick={() => navigate("/")} className={`nav-item ${currentPage === "/" ? "active" : ""}`}>
            Home
          </span>

          <span onClick={() => navigate("/courses")} className={`nav-item ${currentPage === "/courses" ? "active" : ""}`}>
            Courses
          </span>

          <span onClick={() => navigate("/contact")} className={`nav-item ${currentPage === "/contact" ? "active" : ""}`}>
            Contact
          </span>

          <div className="auth-buttons">

            {!user ? (
              <>
                <span onClick={() => navigate("/login")} className="nav-item">
                  Login
                </span>
                <Button onClick={() => navigate("/register")} className="btn-primary">
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                <div
                  onClick={() => navigate("/profile")}
                  className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center cursor-pointer"
                >
                  <UserCircle size={22} />
                </div>

                <button onClick={logout} className="ml-3 text-teal-700 flex items-center">
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}
