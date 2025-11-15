import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './Button';
import { BookOpen } from 'lucide-react';
import "../styles/globals.css";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

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
          <span
            onClick={() => handleNavigation('/')}
            className={`nav-item ${currentPage === '/' ? 'active' : ''}`}
          >
            Home
          </span>

          <span
            onClick={() => handleNavigation('/courses')}
            className={`nav-item ${currentPage === '/courses' ? 'active' : ''}`}
          >
            Courses
          </span>

          <span
            onClick={() => handleNavigation('/contact')}
            className={`nav-item ${currentPage === '/contact' ? 'active' : ''}`}
          >
            Contact
          </span>

          <div className="auth-buttons">
            <span
              onClick={() => handleNavigation('/login')}
              className={`nav-item ${currentPage === '/login' ? 'active' : ''}`}
            >
              Login
            </span>
            <Button
              onClick={() => handleNavigation('/register')}
              className="btn-primary"
            >
              Sign Up
            </Button>
            <Button
              onClick={() => handleNavigation('/student/profile')}
              className="btn-primary"
            >
              Profile
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}