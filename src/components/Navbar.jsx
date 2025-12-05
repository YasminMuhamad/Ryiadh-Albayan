import React, { useEffect, useRef, useMemo, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  onNotificationsListener,
  markNotificationsAsRead,
} from "../services/notificationService";
import { toast } from "react-hot-toast";

import { BookOpen, ShoppingCart, UserCircle, LogOut, Bell, X, LayoutDashboardIcon, LayoutDashboard } from "lucide-react";
import { Button } from "./Button";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, logout } = useAuth();
  const currentPage = location.pathname;
  const [cartCount, setCartCount] = useState();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const displayedToastIds = useRef(new Set());
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onNotificationsListener(user.uid, (notifs) => {
      setNotifications(notifs);

      // فلتر للإشعارات الغير مقروءة والتي لم يتم عرضها بعد
      const unread = notifs.filter(
        (n) => !n.read && !displayedToastIds.current.has(n.id)
      );

      unread.forEach((n) => {
        toast.custom(
          (t) => (
            <div
              className={`p-3 rounded shadow-md bg-white border flex justify-between items-start gap-2 ${t.visible ? "animate-enter" : "animate-leave"
                }`}
            >
              <div>
                <strong>{n.title}</strong>
                <p>{n.message}</p>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={16} />
              </button>
            </div>
          ),
          { duration: 4000, position: "top-right" }
        );

        // علم ان الاشعار ده اتعرض
        displayedToastIds.current.add(n.id);
      });
    });

    return () => unsubscribe();
  }, [user]);

  // عند فتح dropdown علم الاشعارات الغير مقروءة كمقروءة
  useEffect(() => {
    if (showDropdown && notifications.length > 0) {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
      if (unreadIds.length) markNotificationsAsRead(unreadIds);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }, [showDropdown, notifications]);
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
            <Link
              to="/cart"
              className={`nav-item flex items-center gap-1 px-2 py-1 rounded-full transition ${
                currentPage === "/cart" ? "font-bold bg-gray-100" : ""
              }`}
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-teal-600 text-white text-xs rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          <div className="flex items-center gap-6">
            {profile ? (
              <>
                <div className="relative">
                  <button
                    className="p-2 rounded-full hover:bg-gray-200 relative"
                    onClick={() => setShowDropdown((prev) => !prev)}
                  >
                    <Bell className="text-gray-700" />
                    {notifications.some((n) => !n.read) && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                        {notifications.filter((n) => !n.read).length}
                      </span>
                    )}
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white text-black rounded shadow-lg z-50 max-h-96 overflow-y-auto">
                      <div className="flex justify-end p-2">
                        <button onClick={() => setShowDropdown(false)}>
                          <X size={18} />
                        </button>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="px-4 py-2 text-gray-500">
                          لا توجد إشعارات
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`border-b px-4 py-2 ${!n.read ? "bg-gray-100" : ""
                              }`}
                          >
                            <strong>{n.title}</strong>
                            <p>{n.message}</p>
                            <small className="text-gray-500">{n.type}</small>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
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
