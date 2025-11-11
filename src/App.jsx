// 

import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import ProtectedRoute from "./context/ProtectedRoute";
import LawyerDashboard from "./pages/LawyerDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLawyers from "./pages/AdminLawyers";
import AdminClients from "./pages/AdminClients";
import AdminActivityLogs from "./pages/AdminActivityLogs";
import LawyerDetails from "./pages/LawyerDetails";
import LawyerRequests from "./pages/LawyerRequests";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/lawyer/:id" element={<LawyerDetails />} />

        <Route
          path="/Lawyer"
          element={
            <ProtectedRoute role="Lawyer">
              <LawyerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lawyer/requests"
          element={
            <ProtectedRoute role="Lawyer">
              <LawyerRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Client"
          element={
            <ProtectedRoute role="Client">
              <ClientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Admin"
          element={
            <ProtectedRoute role="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Admin/Lawyers"
          element={
            <ProtectedRoute role="Admin">
              <AdminLawyers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Admin/Clients"
          element={
            <ProtectedRoute role="Admin">
              <AdminClients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Admin/Activity-Logs"
          element={
            <ProtectedRoute role="Admin">
              <AdminActivityLogs />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
