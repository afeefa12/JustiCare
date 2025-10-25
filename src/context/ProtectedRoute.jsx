import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  // Wait until AuthContext finishes loading
  if (loading) return <div>Loading...</div>;

  // Redirect if not logged in
  if (!user) return <Navigate to="/login" />;

  // Redirect if role does not match
  if (role && user.role !== role) return <Navigate to="/login" />;

  // Render children if authorized
  return children;
}