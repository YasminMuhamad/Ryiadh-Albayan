import React, { useEffect, useRef, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen,ShoppingCart, UserCircle,LogOut, Bell, X, LayoutDashboardIcon, LayoutDashboard } from "lucide-react";
import { Button } from "./Button";
import { useAuth } from "../context/AuthContext";
import {
  onNotificationsListener,
  markNotificationsAsRead,
} from "../services/notificationService";
import { toast } from "react-hot-toast";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const displayedToastIds = useRef(new Set()); // Set لحفظ الاشعارات اللي اتعرضت

  const handleNavigation = (path) => navigate(path);
  const currentPage = location.pathname;

  // استماع للإشعارات وعرض التوست للغير مقروءة فقط
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
              className={`p-3 rounded shadow-md bg-white border flex justify-between items-start gap-2 ${
                t.visible ? "animate-enter" : "animate-leave"
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

  return (
    <nav className="navbar">
      <div className="navbar-content flex justify-between items-center px-4 py-2 bg-white">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 flex items-center justify-center rounded-full"
            style={{ backgroundColor: "#E6EFEB" }}
          >
            <BookOpen className="text-2xl" style={{ color: "#0E7C7B" }} />
          </div>
          <div>
            <span
              onClick={() => handleNavigation("/")}
              className="text-lg font-bold cursor-pointer"
            >
              Riyad Al-Bayan
            </span>
            <p className="text-sm text-gray-500">Arabic & Islamic Studies</p>
          </div>
        </div>

        {/* Nav Links + Auth + Notifications */}
        <div className="flex items-center gap-4">
          <span
            onClick={() => navigate("/")}
            className={`nav-item ${currentPage === "/" ? "font-bold" : ""}`}
          >
            Home
          </span>
          <span
            onClick={() => navigate("/courses")}
            className={`nav-item ${
              currentPage === "/courses" ? "font-bold" : ""
            }`}
          >
            Courses
          </span>
          <span onClick={() => navigate("/my-courses")} className={`nav-item ${currentPage === "/my-courses" ? "active" : ""}`}>
            My Courses
          </span>

          <span onClick={() => navigate("/contact")} className={`nav-item ${currentPage === "/contact" ? "active" : ""}`}>
            Contact
          </span>

          {user && (
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
                        className={`border-b px-4 py-2 ${
                          !n.read ? "bg-gray-100" : ""
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
          )}

          <div className="auth-buttons flex items-center gap-2">
            {!user ? (
              <>
                <span onClick={() => navigate("/login")} className="nav-item">
                  Login
                </span>
                <Button
                  onClick={() => navigate("/register")}
                  className="btn-primary"
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                <div
                  onClick={() => navigate("/student/profile")}
                  className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center cursor-pointer"
                >
                  <UserCircle size={22} />
                </div>
                <button
                  onClick={logout}
                  className="ml-3 text-teal-700 flex items-center"
                >
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
