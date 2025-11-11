import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminActivityLogs() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");

  const actionTypes = [
    "All",
    "LawyerApproved",
    "LawyerRejected",
    "LawyerSuspended",
    "ClientFlagged",
    "ClientUnflagged",
    "ClientActivated",
    "ClientDeactivated",
  ];

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async (actionType = "", search = "") => {
    try {
      setLoading(true);
      let url = "/api/Admin/activity-logs";
      const params = new URLSearchParams();
      
      if (actionType && actionType !== "All") {
        params.append("actionType", actionType);
      }
      if (search) {
        params.append("search", search);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await api.get(url);
      if (res.data.statusCode === "200") {
        setLogs(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      alert("Failed to fetch activity logs");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const type = filterType === "All" ? "" : filterType;
    fetchLogs(type, searchTerm);
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    const searchValue = searchTerm;
    const typeValue = type === "All" ? "" : type;
    fetchLogs(typeValue, searchValue);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterType("All");
    fetchLogs("", "");
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

  const getActionColor = (actionType) => {
    const colors = {
      LawyerApproved: "bg-green-100 text-green-800",
      LawyerRejected: "bg-red-100 text-red-800",
      LawyerSuspended: "bg-yellow-100 text-yellow-800",
      ClientFlagged: "bg-red-100 text-red-800",
      ClientUnflagged: "bg-green-100 text-green-800",
      ClientActivated: "bg-green-100 text-green-800",
      ClientDeactivated: "bg-gray-100 text-gray-800",
    };
    return colors[actionType] || "bg-blue-100 text-blue-800";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-700">
          Loading activity logs...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/Admin")}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Activity Logs
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.username} ({user?.role})
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search by description, username, or action..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Search
              </button>
              <button
                onClick={handleClearFilters}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Action Type Filter */}
            <div className="flex flex-wrap gap-2">
              {actionTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleFilterChange(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    filterType === type
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type === "All" ? "All Actions" : type.replace(/([A-Z])/g, " $1").trim()}
                </button>
              ))}
            </div>

            <p className="text-sm text-gray-600">
              Showing {logs.length} activity log{logs.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Activity Logs Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Performed By
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Target
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getActionColor(
                          log.actionType
                        )}`}
                      >
                        <span>{getActionIcon(log.actionType)}</span>
                        <span>{log.actionType.replace(/([A-Z])/g, " $1").trim()}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.performedByUsername || "System"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.targetUsername ? (
                        <div>
                          <div className="font-medium">{log.targetUsername}</div>
                          <div className="text-xs text-gray-500">
                            {log.targetUserRole}
                          </div>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.ipAddress || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {logs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-500 text-lg">No activity logs found</p>
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        {logs.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Activity Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {actionTypes
                .filter((type) => type !== "All")
                .map((type) => {
                  const count = logs.filter(
                    (log) => log.actionType === type
                  ).length;
                  if (count === 0) return null;
                  return (
                    <div
                      key={type}
                      className="bg-gray-50 rounded-lg p-4 text-center"
                    >
                      <div className="text-2xl mb-1">
                        {getActionIcon(type)}
                      </div>
                      <div className="text-2xl font-bold text-gray-800">
                        {count}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {type.replace(/([A-Z])/g, " $1").trim()}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
