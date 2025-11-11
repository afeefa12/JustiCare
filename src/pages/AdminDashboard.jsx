import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalLawyers: 0,
    approvedLawyers: 0,
    pendingLawyers: 0,
    suspendedLawyers: 0,
    totalClients: 0,
    activeClients: 0,
    flaggedClients: 0,
    totalConsultations: 0,
    totalCases: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/api/Admin/stats");
      if (res.data.statusCode === "200") {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const res = await api.get("/api/Admin/activity-logs/recent?count=5");
      if (res.data.statusCode === "200") {
        setRecentLogs(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching recent activity:", error);
    }
  };

  const getActionIcon = (actionType) => {
    const icons = {
      LawyerApproved: "✅",
      LawyerRejected: "❌",
      LawyerSuspended: "⏸️",
      ClientFlagged: "🚩",
      ClientUnflagged: "✓",
      ClientActivated: "🟢",
      ClientDeactivated: "🔴",
    };
    return icons[actionType] || "📝";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg text-white">
            <h3 className="text-sm font-medium opacity-90">Total Lawyers</h3>
            <p className="text-4xl font-bold mt-2">{loading ? "..." : stats.totalLawyers}</p>
            <p className="text-xs mt-2 opacity-75">
              {stats.approvedLawyers} approved | {stats.pendingLawyers} pending
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg text-white">
            <h3 className="text-sm font-medium opacity-90">Total Clients</h3>
            <p className="text-4xl font-bold mt-2">{loading ? "..." : stats.totalClients}</p>
            <p className="text-xs mt-2 opacity-75">
              {stats.activeClients} active | {stats.flaggedClients} flagged
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg text-white">
            <h3 className="text-sm font-medium opacity-90">Consultations</h3>
            <p className="text-4xl font-bold mt-2">{loading ? "..." : stats.totalConsultations}</p>
            <p className="text-xs mt-2 opacity-75">Total scheduled</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 shadow-lg text-white">
            <h3 className="text-sm font-medium opacity-90">Total Cases</h3>
            <p className="text-4xl font-bold mt-2">{loading ? "..." : stats.totalCases}</p>
            <p className="text-xs mt-2 opacity-75">All cases filed</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/Admin/Lawyers")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 hover:shadow-xl transition-all text-left"
            >
              <div className="text-3xl mb-2">👨‍⚖️</div>
              <h3 className="text-lg font-semibold">Manage Lawyers</h3>
              <p className="text-sm opacity-90 mt-1">
                Approve, edit, or suspend lawyers
              </p>
              {stats.pendingLawyers > 0 && (
                <div className="mt-3 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full inline-block">
                  {stats.pendingLawyers} pending approval
                </div>
              )}
            </button>

            <button
              onClick={() => navigate("/Admin/Clients")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-6 hover:shadow-xl transition-all text-left"
            >
              <div className="text-3xl mb-2">👥</div>
              <h3 className="text-lg font-semibold">Manage Clients</h3>
              <p className="text-sm opacity-90 mt-1">
                View, flag, or deactivate clients
              </p>
              {stats.flaggedClients > 0 && (
                <div className="mt-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full inline-block">
                  {stats.flaggedClients} flagged
                </div>
              )}
            </button>

            <button
              onClick={() => navigate("/Admin/Activity-Logs")}
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl p-6 hover:shadow-xl transition-all text-left"
            >
              <div className="text-3xl mb-2">📋</div>
              <h3 className="text-lg font-semibold">Activity Logs</h3>
              <p className="text-sm opacity-90 mt-1">
                View all system actions and history
              </p>
            </button>

            <button
              onClick={() => alert("Feature coming soon!")}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all text-left"
            >
              <div className="text-3xl mb-2">📊</div>
              <h3 className="text-lg font-semibold text-gray-800">Analytics</h3>
              <p className="text-sm text-gray-600 mt-1">
                View platform statistics and reports
              </p>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {(stats.suspendedLawyers > 0 || stats.flaggedClients > 0) && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Alerts</h2>
            <div className="space-y-3">
              {stats.suspendedLawyers > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                  <p className="text-yellow-800">
                    ⚠️ <strong>{stats.suspendedLawyers}</strong> lawyer(s) currently suspended. Review status.
                  </p>
                </div>
              )}
              {stats.flaggedClients > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                  <p className="text-red-800">
                    🚩 <strong>{stats.flaggedClients}</strong> client(s) flagged for review.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="mt-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
            <button
              onClick={() => navigate("/Admin/Activity-Logs")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-3">
            {recentLogs.length > 0 ? (
              recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <div className="text-xl">{getActionIcon(log.actionType)}</div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{log.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {log.performedByUsername || "System"} • {formatDate(log.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

