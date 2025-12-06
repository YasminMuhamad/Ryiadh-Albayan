import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  onNotificationsListener,
  markNotificationsAsRead,
} from "../services/notificationService";
import { toast } from "react-hot-toast";
import {
  BookOpen,
  ShoppingCart,
  UserCircle,
  LogOut,
  Bell,
  X,
  LayoutDashboard,
  Menu,
} from "lucide-react";
import { Button } from "./Button";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, logout } = useAuth();
  const currentPage = location.pathname;
  const [cartCount, setCartCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const displayedToastIds = useRef(new Set());

  const { role } = useAuth();
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onNotificationsListener(user.uid, (notifs) => {
      setNotifications(notifs);

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
        displayedToastIds.current.add(n.id);
      });
    });

    return () => unsubscribe();
  }, [user]);

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
    <nav className="fixed top-0 left-0 right-0 bg-white z-50 shadow px-4 md:px-8 py-2">
      <div className="flex justify-between items-center w-full">
        {/* Logo Section */}
        <div className="flex items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#E6EFEB]">
            <BookOpen className="text-2xl text-[#0E7C7B]" />
          </div>
          <div className="ml-3">
            <span
              onClick={() => navigate("/")}
              className="font-semibold text-lg cursor-pointer text-[#0E7C7B]"
            >
              Riyad Al-Bayan
            </span>
            <p className="text-sm text-gray-500">Arabic & Islamic Studies</p>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-6">
          {!(role === "admin" || role === "teacher") && (
            <div className="flex items-center gap-4">
              <span
                onClick={() => navigate("/")}
                className={`cursor-pointer ${
                  currentPage === "/" ? "text-[#0E7C7B]" : "text-gray-700"
                } hover:text-[#0E7C7B]`}
              >
                Home
              </span>
              <span
                onClick={() => navigate("/courses")}
                className={`cursor-pointer ${
                  currentPage === "/courses" ? "text-[#0E7C7B]" : "text-gray-700"
                } hover:text-[#0E7C7B]`}
              >
                Courses
              </span>
              <span
                onClick={() => navigate("/contact")}
                className={`cursor-pointer ${
                  currentPage === "/contact" ? "text-[#0E7C7B]" : "text-gray-700"
                } hover:text-[#0E7C7B]`}
              >
                Contact
              </span>
              <div className="relative">
                <span
                  onClick={() => navigate("/cart")}
                  className={`flex items-center cursor-pointer ${
                    currentPage === "/cart" ? "text-[#0E7C7B]" : "text-gray-700"
                  } hover:text-[#0E7C7B]`}
                >
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-teal-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Profile / Auth */}
          {profile ? (
            <div className="flex items-center gap-4">
              {/* Notifications */}
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
                        No notifications yet.
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

              <span className="border-l border-gray-300 h-6"></span>

              {/* Dashboard */}
              <span
                onClick={goToDashboard}
                className={`${
                  currentPage.includes("/dashboard")
                    ? "text-[#0E7C7B]"
                    : "text-gray-700"
                } flex items-center gap-2 cursor-pointer`}
              >
                <LayoutDashboard size={20} />
                Dashboard
              </span>

              {/* Profile */}
              <span
                onClick={goToProfile}
                className={`${
                  currentPage.includes("/profile")
                    ? "text-[#0E7C7B]"
                    : "text-gray-700"
                } flex items-center gap-2 cursor-pointer`}
              >
                <img
                  src={profile.profile_pic || "/placeholder-avatar.png"}
                  alt={profile.name || "User"}
                  className="w-6 h-6 rounded-xl object-cover"
                />
                <span>{profile.name || "User"}</span>
              </span>

              {/* Logout */}
              <span
                onClick={handleLogout}
                className="flex items-center gap-1 text-gray-700 hover:text-red-600 cursor-pointer transition"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span
                onClick={() => navigate("/login")}
                className="cursor-pointer text-gray-700 hover:text-teal-700"
              >
                Login
              </span>
              <Button
                onClick={() => navigate("/register")}
                className="btn-primary"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>

        {/* Hamburger for Mobile */}
        <div className="lg:hidden">
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded hover:bg-gray-200"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col md:hidden z-50">
          {!(role === "admin" || role === "teacher") && (
            <>
              <span
                onClick={() => {
                  navigate("/");
                  setMobileMenuOpen(false);
                }}
                className="p-3 border-b hover:bg-gray-100 cursor-pointer"
              >
                Home
              </span>
              <span
                onClick={() => {
                  navigate("/courses");
                  setMobileMenuOpen(false);
                }}
                className="p-3 border-b hover:bg-gray-100 cursor-pointer"
              >
                Courses
              </span>
              <span
                onClick={() => {
                  navigate("/contact");
                  setMobileMenuOpen(false);
                }}
                className="p-3 border-b hover:bg-gray-100 cursor-pointer"
              >
                Contact
              </span>
              <span
                onClick={() => {
                  navigate("/cart");
                  setMobileMenuOpen(false);
                }}
                className="p-3 border-b hover:bg-gray-100 cursor-pointer flex items-center justify-between"
              >
                Cart
                {cartCount > 0 && (
                  <span className="bg-teal-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </span>
            </>
          )}

          {profile ? (
            <>
              <span
                onClick={() => {
                  goToDashboard();
                  setMobileMenuOpen(false);
                }}
                className="p-3 border-b hover:bg-gray-100 cursor-pointer"
              >
                Dashboard
              </span>
              <span
                onClick={() => {
                  goToProfile();
                  setMobileMenuOpen(false);
                }}
                className="p-3 border-b hover:bg-gray-100 cursor-pointer flex items-center gap-2"
              >
                <img
                  src={profile.profile_pic || "/placeholder-avatar.png"}
                  alt="User"
                  className="w-6 h-6 rounded-full object-cover"
                />
                {profile.name || "User"}
              </span>
              <span
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="p-3 border-b hover:bg-gray-100 cursor-pointer text-red-600"
              >
                Logout
              </span>
            </>
          ) : (
            <>
              <span
                onClick={() => {
                  navigate("/login");
                  setMobileMenuOpen(false);
                }}
                className="p-3 border-b hover:bg-gray-100 cursor-pointer"
              >
                Login
              </span>
              <span
                onClick={() => {
                  navigate("/register");
                  setMobileMenuOpen(false);
                }}
                className="p-3 border-b hover:bg-gray-100 cursor-pointer"
              >
                Sign Up
              </span>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
