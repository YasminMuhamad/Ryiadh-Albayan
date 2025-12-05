import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../components/Button";
import { BookOpen, Bell } from "lucide-react"; // أيقونة الجرس
import { useAuth } from "../../context/AuthContext";
import { onNotificationsListener } from "../../services/notificationService";
import { toast } from "react-hot-toast";

import "../../styles/globals.css";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  console.log("User in NavBar:");
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleTheme = () => {
    document.body.classList.toggle("dark");
  };

  // Listener للإشعارات
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onNotificationsListener(user.uid, (notifs) => {
      setNotifications(notifs);

      // توست عند وصول إشعار جديد
      if (notifs.length) {
        const latest = notifs[0];
        toast(`${latest.title}: ${latest.message}`, {
          duration: 4000,
          position: "top-right",
        });
      }
    });
    console.log("Current User in NavBar:", user);

    return () => unsubscribe();
  }, [user]);

  const currentPage = location.pathname;

  return (
    <nav className="navbar">
      <div className="navbar-content flex justify-between items-center px-4 py-2 shadow-md bg-white dark:bg-gray-800">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <BookOpen className="text-2xl" />
          <div>
            <span
              onClick={() => handleNavigation("/")}
              className="text-lg font-bold cursor-pointer"
            >
              Riyad Al-Bayan
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              Arabic & Islamic Studies
            </p>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex items-center gap-4">
          <span
            onClick={handleTheme}
            className="cursor-pointer text-gray-700 dark:text-gray-300"
          >
            Dark/Light
          </span>

          {/* إشعارات المستخدم */}
          {user && (
            <div className="relative">
              <button
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 relative"
                onClick={() => setShowDropdown((prev) => !prev)}
              >
                <Bell className="text-gray-700 dark:text-gray-300" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Dropdown للإشعارات */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 text-black dark:text-white rounded shadow-lg z-50 max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-2 text-gray-500 dark:text-gray-300">
                      لا توجد إشعارات
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="border-b px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <strong>{n.title}</strong>
                        <p>{n.message}</p>
                        <small className="text-gray-500 dark:text-gray-400">
                          {n.type}
                        </small>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <span
              onClick={() => handleNavigation("/login")}
              className={`cursor-pointer ${
                currentPage === "/login" ? "font-bold" : ""
              }`}
            >
              Settings
            </span>
            <Button
              onClick={() => handleNavigation("/signup")}
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
