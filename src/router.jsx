// import { useContext } from "react";
// import { AuthContext } from "./context/AuthContext";
// import { Navigate } from "react-router-dom";

// const ProtectedRoute = ({ children, role }) => {
//   const { user, role: userRole, loading } = useContext(AuthContext);

//   if (loading) return <p>Loading...</p>;
//   if (!user) return <Navigate to="/login" />;
//   if (userRole !== role) return <Navigate to="/" />;

//   return children;
// };

// export default ProtectedRoute;
// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../src/context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;

  // if role is provided ensure profile.role matches
  if (role && profile?.role !== role) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
