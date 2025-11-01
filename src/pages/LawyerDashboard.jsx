import React from "react";
import { useAuth } from "../context/AuthContext";

export default function LawyerDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-10">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-blue-700">
            ⚖️ Welcome, {user?.username || "Lawyer"}
          </h1>
          <button
            onClick={logout}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all"
          >
            Logout
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-blue-100 rounded-xl p-6 shadow-inner">
            <h3 className="text-lg font-semibold text-blue-700">Active Clients</h3>
            <p className="text-3xl font-bold mt-2 text-blue-900">12</p>
          </div>
          <div className="bg-purple-100 rounded-xl p-6 shadow-inner">
            <h3 className="text-lg font-semibold text-purple-700">Upcoming Appointments</h3>
            <p className="text-3xl font-bold mt-2 text-purple-900">5</p>
          </div>
          <div className="bg-green-100 rounded-xl p-6 shadow-inner">
            <h3 className="text-lg font-semibold text-green-700">Total Consultations</h3>
            <p className="text-3xl font-bold mt-2 text-green-900">38</p>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Recent Client Messages</h2>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <p className="text-gray-600 italic">
              "Looking forward to our meeting tomorrow!" — <b>Client A</b>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
