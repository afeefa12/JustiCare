import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function LawyerRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchRequests = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/api/Enquiry/lawyer/${user.id}`);
      // Backend might return array directly or ApiResponse
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setRequests(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user?.id]);

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      await api.put(`/api/Enquiry/${id}/update-status`, null, {
        params: { status },
      });
      await fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Client Enquiries</h1>
          {loading && (
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Loading...</span>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-600 text-sm text-center font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && requests.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 text-lg">No enquiries yet</p>
          </div>
        )}

        {!loading && requests.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Enquiry ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Client ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Message</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id || `${req.clientId}-${req.createdAt}`} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-700">#{req.id || "—"}</td>
                    <td className="py-3 px-4 text-gray-700">{req.clientId}</td>
                    <td className="py-3 px-4 text-gray-700 max-w-md">{req.message}</td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {req.enquiryStatus || "Pending"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{new Date(req.createdAt).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateStatus(req.id, "Accepted")}
                          disabled={updatingId === req.id}
                          className="px-3 py-1 rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateStatus(req.id, "Rejected")}
                          disabled={updatingId === req.id}
                          className="px-3 py-1 rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


