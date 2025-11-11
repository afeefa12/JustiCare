// import React from "react";
// import { Navigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// export default function ProtectedRoute({ role, children }) {
//   const { user, loading } = useAuth();

//   // Wait until AuthContext finishes loading
//   if (loading) return <div>Loading...</div>;

//   // Redirect if not logged in
//   if (!user) return <Navigate to="/login" />;

//   // Redirect if role does not match
//   if (role && user.role !== role) return <Navigate to="/login" />;

//   // Render children if authorized
//   return children;
// }


import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" />;
  
  // Handle role mapping: "User" should match "Client"
  const userRole = user.role;
  const expectedRole = role;
  if (expectedRole && userRole !== expectedRole && !(userRole === "User" && expectedRole === "Client")) {
    return <Navigate to="/login" />;
  }

  return children;
}
