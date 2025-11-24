import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/Button'; 
import { BookOpen } from 'lucide-react';
import "../../styles/globals.css";

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
          <div className="logo">
            <BookOpen />
          </div>
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

        <div className="nav-links">
          <span
            onClick={() => handleTheme()}
          >
            Dark/Light
          </span>

          <div className="auth-buttons">
            <span
              onClick={() => handleNavigation('/login')}
              className={`nav-item ${currentPage === '/login' ? 'active' : ''}`}
            >
              Settings
            </span>
            <Button
              onClick={() => handleNavigation('/signup')}
              className="btn-primary"
            >
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}