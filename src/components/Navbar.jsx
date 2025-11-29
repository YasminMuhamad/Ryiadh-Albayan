import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './Button'; 
import { BookOpen, ShoppingCart } from 'lucide-react';
import "../styles/globals.css";

export function Navbar() {
  const navigate = useNavigate(); 
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);

  const handleNavigation = (path) => {
    navigate(path);  
  };

  const currentPage = location.pathname;

  // Update cart count
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.length);
  };

  useEffect(() => {
    // Initial count
    updateCartCount();
    
    // Listen for cart updates
    window.addEventListener('cartUpdated', updateCartCount);
    
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

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

          {/* Cart Button */}
          <div className="relative">
            <span
              onClick={() => handleNavigation('/cart')}
              className={`nav-item flex items-center ${currentPage === '/cart' ? 'active' : ''}`}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-teal-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </span>
          </div>

          <div className="auth-buttons">
            <span
              onClick={() => handleNavigation('/login')}
              className={`nav-item ${currentPage === '/login' ? 'active' : ''}`}
            >
              Login
            </span>
            <Button
              onClick={() => handleNavigation('/signup')}
              className="btn-primary"
            >
              Sign Up
            </Button>
            <span
              onClick={() => handleNavigation('/login')}
              className={`nav-item ${currentPage === '/login' ? 'active' : ''}`}
            >
              Login
            </span>
            <Button
              onClick={() => handleNavigation('/signup')}
              className="btn-primary"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}