import React from "react";
import { Navigate } from "react-router-dom";
import Loader from "./components/Loader";
import { useAuth } from "./context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { profile, loading } = useAuth();

  if (loading) return <Loader />;
  if (!profile) return <Navigate to="/login" replace />;
  if (role && profile.role !== role) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;