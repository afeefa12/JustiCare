import React from "react";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-10">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800">
            ⚙️ Admin Panel — {user?.username || "Admin"}
          </h1>
          <button
            onClick={logout}
            className="bg-gradient-to-r from-gray-600 to-blue-600 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all"
          >
            Logout
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-blue-100 rounded-xl p-6 shadow-inner">
            <h3 className="text-lg font-semibold text-blue-700">Registered Lawyers</h3>
            <p className="text-3xl font-bold mt-2 text-blue-900">45</p>
          </div>
          <div className="bg-purple-100 rounded-xl p-6 shadow-inner">
            <h3 className="text-lg font-semibold text-purple-700">Active Clients</h3>
            <p className="text-3xl font-bold mt-2 text-purple-900">120</p>
          </div>
          <div className="bg-green-100 rounded-xl p-6 shadow-inner">
            <h3 className="text-lg font-semibold text-green-700">Total Consultations</h3>
            <p className="text-3xl font-bold mt-2 text-green-900">240</p>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Recent Activity</h2>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-2">
            <p className="text-gray-700">✅ Lawyer "Adv. Sneha" approved.</p>
            <p className="text-gray-700">⚠️ Client "Rahul" flagged for review.</p>
            <p className="text-gray-700">📊 Monthly analytics updated.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

