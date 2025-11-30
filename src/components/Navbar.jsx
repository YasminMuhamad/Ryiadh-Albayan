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
  const { user, logout } = useAuth();

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
          </div>
        </div>
      </div>
    </nav>
  );
}
