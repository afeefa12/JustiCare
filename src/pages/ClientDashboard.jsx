import React from "react";
import { useAuth } from "../context/AuthContext";

export default function ClientDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-10">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-purple-700">
            👋 Welcome, {user?.username || "Client"}
          </h1>
          <button
            onClick={logout}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all"
          >
            Logout
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-purple-100 rounded-xl p-6 shadow-inner">
            <h3 className="text-lg font-semibold text-purple-700">Consultations Booked</h3>
            <p className="text-3xl font-bold mt-2 text-purple-900">3</p>
          </div>
          <div className="bg-blue-100 rounded-xl p-6 shadow-inner">
            <h3 className="text-lg font-semibold text-blue-700">Pending Responses</h3>
            <p className="text-3xl font-bold mt-2 text-blue-900">2</p>
          </div>
          <div className="bg-green-100 rounded-xl p-6 shadow-inner">
            <h3 className="text-lg font-semibold text-green-700">Completed Sessions</h3>
            <p className="text-3xl font-bold mt-2 text-green-900">10</p>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Your Lawyer</h2>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <p className="text-gray-700">
              <b>Adv. John Mathew</b> — Corporate Law Specialist <br />
              <span className="text-sm text-gray-500">Next meeting: Nov 2, 2025</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
