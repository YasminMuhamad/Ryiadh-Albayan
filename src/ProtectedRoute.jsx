import React from "react";
import { Navigate } from "react-router-dom";
import Loader from "./components/Loader";
import { useAuth } from "./context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { profile, loading } = useAuth(); // استخدم profile بدل user

  if (loading) return <Loader />; // عرض Loader أثناء التحميل
  if (!profile) return <Navigate to="/login" replace />; // لو مش مسجل دخول
  if (role && profile.role !== role) return <Navigate to="/" replace />; // حماية حسب الدور

  return children;
};

export default ProtectedRoute;