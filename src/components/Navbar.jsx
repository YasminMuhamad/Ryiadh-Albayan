import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen,ShoppingCart, UserCircle, LogOut, LayoutDashboardIcon, LayoutDashboard } from "lucide-react";
import { Button } from "./Button";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, logout } = useAuth();
  const currentPage = location.pathname;
  const [ cartCount, setCartCount ] = useState();
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.length);
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);
    return () => window.removeEventListener("cartUpdated", updateCartCount);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  const { role } = useAuth();

  const goToProfile = () => {
    if (role === "admin") navigate("/admin/profile");
    else if (role === "teacher") navigate("/teacher/profile");
    else navigate("/student/profile");
  };
  const goToDashboard = () => {
    if (role === "admin") navigate("/admin/dashboard");
    else if (role === "teacher") navigate("/teacher/dashboard");
    else navigate("/student/dashboard");
  };

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

            <div className="flex items-center gap-6">
              {profile ? (
                <>
                  <span className="border-l border-gray-300 h-6"></span>
                  <span
                    onClick={goToDashboard}
                    className="cursor-pointer flex items-center gap-2"
                  >
                    <LayoutDashboard size={20} className="text-teal-600" />
                    <span className="nav-item">Dashboard</span>
                  </span>

                  <span
                    onClick={goToProfile}
                    className="cursor-pointer flex items-center gap-2"
                  >
                    {profile.profile_pic ? (
                      <img
                        src="/placeholder-avatar.png"
                        height={'20px'}
                        width={'20px'}
                        alt={profile.name || "User"}
                        className="nav-item rounded-xl"
                      />
                    ) : (
                      <UserCircle size={26} className="text-teal-600" />
                    )}
                    <span className="nav-item">
                      {profile.name || "User"}
                    </span>
                  </span>

                  {/* Logout */}
                  <span
                    onClick={handleLogout}
                    className="cursor-pointer flex items-center gap-1 text-gray-700 hover:text-red-600 transition"
                  >
                    <LogOut size={18} />
                    <span className="hidden sm:inline">Logout</span>
                  </span>
                </>
              ) : (
                <>
                  <span
                    onClick={() => navigate("/login")}
                    className="cursor-pointer text-gray-700 hover:text-teal-700"
                  >
                    Login
                  </span>

                  <Button onClick={() => navigate("/register")} className="btn-primary">
                    Sign Up
                  </Button>
                </>
              )}
            </div>

          </div>
        </div>
    </nav>
  );
}
