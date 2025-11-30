import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, ShoppingCart, UserCircle, LogOut } from "lucide-react";
import { Button } from "./Button";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, profile } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const currentPage = location.pathname;

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.length);
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);
    return () => window.removeEventListener("cartUpdated", updateCartCount);
  }, []);

  const dashboardPath = useMemo(() => {
    if (profile?.role === "teacher") return "/teacher/dashboard";
    if (profile?.role === "admin") return "/admin";
    return "/student/dashboard";
  }, [profile]);

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="logo-section">
          <div className="flex items-center justify-center">
            <div
              className="w-12 h-12 flex items-center justify-center rounded-full"
              style={{ backgroundColor: "#E6EFEB" }}
            >
              <BookOpen className="text-2xl" style={{ color: "#0E7C7B" }} />
            </div>
            <div className="logo-text">
              <span
                onClick={() => handleNavigation("/")}
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

          <div className="relative">
            <span
              onClick={() => handleNavigation("/cart")}
              className={`nav-item flex items-center ${currentPage === "/cart" ? "active" : ""}`}
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
                  onClick={() => navigate(dashboardPath)}
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
