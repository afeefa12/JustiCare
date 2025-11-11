import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminClients() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [enquiries, setEnquiries] = useState([]);
  const [consultations, setConsultations] = useState([]);

  // Form states
  const [flagForm, setFlagForm] = useState({
    isFlagged: false,
    reason: "",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/Admin/clients");
      if (res.data.statusCode === "200") {
        setClients(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      alert("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (clientId, currentStatus) => {
    const newStatus = !currentStatus;
    const confirmMsg = newStatus
      ? "Are you sure you want to activate this client?"
      : "Are you sure you want to deactivate this client?";

    if (!confirm(confirmMsg)) return;

    try {
      const res = await api.patch(`/api/Admin/clients/${clientId}/status`, {
        isActive: newStatus,
      });
      if (res.data.statusCode === "200") {
        alert(res.data.message);
        fetchClients();
      }
    } catch (error) {
      console.error("Error updating client status:", error);
      alert("Failed to update client status");
    }
  };

  const openFlagModal = (client) => {
    setSelectedClient(client);
    setFlagForm({
      isFlagged: !client.isFlagged,
      reason: client.flagReason || "",
    });
    setShowFlagModal(true);
  };

  const handleFlagClient = async () => {
    try {
      const res = await api.patch(
        `/api/Admin/clients/${selectedClient.id}/flag`,
        flagForm
      );
      if (res.data.statusCode === "200") {
        alert(res.data.message);
        setShowFlagModal(false);
        fetchClients();
      }
    } catch (error) {
      console.error("Error flagging client:", error);
      alert("Failed to flag client");
    }
  };

  const openDetailsModal = async (client) => {
    setSelectedClient(client);
    setShowDetailsModal(true);

    // Fetch enquiries and consultations
    try {
      const [enquiryRes, consultRes] = await Promise.all([
        api.get(`/api/Admin/clients/${client.id}/enquiries`),
        api.get(`/api/Admin/clients/${client.id}/consultations`),
      ]);

      if (enquiryRes.data.statusCode === "200") {
        setEnquiries(enquiryRes.data.data);
      }
      if (consultRes.data.statusCode === "200") {
        setConsultations(consultRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching client details:", error);
    }
  };

  const getStatusBadge = (isActive, isFlagged) => {
    if (isFlagged) return "bg-red-100 text-red-800";
    if (isActive) return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

  const getStatusText = (isActive, isFlagged) => {
    if (isFlagged) return "Flagged";
    if (isActive) return "Active";
    return "Inactive";
  };

  // Filter clients
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "All" ||
      (filterStatus === "Active" && client.isActive && !client.isFlagged) ||
      (filterStatus === "Inactive" && !client.isActive) ||
      (filterStatus === "Flagged" && client.isFlagged);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-700">
          Loading clients...
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
              Client Management
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
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
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {["All", "Active", "Inactive", "Flagged"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filterStatus === status
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Showing {filteredClients.length} of {clients.length} clients
          </p>
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Lawyers Assigned
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Enquiries
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Consultations
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {client.username}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {client.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {client.assignedLawyersCount > 0 ? (
                        <div>
                          <span className="font-medium">
                            {client.assignedLawyersCount}
                          </span>{" "}
                          lawyer(s)
                        </div>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">
                          {client.totalEnquiries}
                        </span>{" "}
                        total
                      </div>
                      <div className="text-xs text-gray-500">
                        {client.acceptedEnquiries} accepted ·{" "}
                        {client.pendingEnquiries} pending
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {client.totalConsultations}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          client.isActive,
                          client.isFlagged
                        )}`}
                      >
                        {getStatusText(client.isActive, client.isFlagged)}
                      </span>
                      {client.isFlagged && client.flagReason && (
                        <div className="text-xs text-red-600 mt-1">
                          {client.flagReason.substring(0, 30)}...
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center flex-wrap">
                        <button
                          onClick={() => openDetailsModal(client)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openFlagModal(client)}
                          className={`px-3 py-1 rounded-lg transition-colors text-xs font-medium ${
                            client.isFlagged
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          }`}
                        >
                          {client.isFlagged ? "Unflag" : "Flag"}
                        </button>
                        <button
                          onClick={() =>
                            handleToggleStatus(client.id, client.isActive)
                          }
                          className={`px-3 py-1 rounded-lg transition-colors text-xs font-medium ${
                            client.isActive
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {client.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No clients found</p>
            </div>
          )}
        </div>
      </div>

      {/* Flag Modal */}
      {showFlagModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {flagForm.isFlagged ? "Flag" : "Unflag"} Client:{" "}
                {selectedClient.username}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {flagForm.isFlagged ? "Reason for flagging" : "Confirm unflag"}
                </label>
                {flagForm.isFlagged ? (
                  <textarea
                    value={flagForm.reason}
                    onChange={(e) =>
                      setFlagForm({ ...flagForm, reason: e.target.value })
                    }
                    placeholder="Enter reason for flagging this client..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    rows="4"
                  />
                ) : (
                  <p className="text-sm text-gray-600">
                    Are you sure you want to remove the flag from this client?
                  </p>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowFlagModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFlagClient}
                className={`px-6 py-2 rounded-lg transition-all ${
                  flagForm.isFlagged
                    ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:shadow-lg"
                    : "bg-gradient-to-r from-green-600 to-blue-600 text-white hover:shadow-lg"
                }`}
              >
                {flagForm.isFlagged ? "Flag Client" : "Unflag Client"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
              <h2 className="text-2xl font-bold text-white">
                {selectedClient.username} - Client Profile
              </h2>
            </div>

            {/* Profile Info */}
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Email</p>
                  <p className="text-sm font-medium">{selectedClient.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                      selectedClient.isActive,
                      selectedClient.isFlagged
                    )}`}
                  >
                    {getStatusText(
                      selectedClient.isActive,
                      selectedClient.isFlagged
                    )}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">
                    Total Enquiries
                  </p>
                  <p className="text-sm font-medium">
                    {selectedClient.totalEnquiries}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">
                    Accepted Enquiries
                  </p>
                  <p className="text-sm font-medium">
                    {selectedClient.acceptedEnquiries}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">
                    Pending Enquiries
                  </p>
                  <p className="text-sm font-medium">
                    {selectedClient.pendingEnquiries}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">
                    Total Consultations
                  </p>
                  <p className="text-sm font-medium">
                    {selectedClient.totalConsultations}
                  </p>
                </div>
              </div>

              {selectedClient.isFlagged && selectedClient.flagReason && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-600 uppercase font-semibold">
                    Flag Reason
                  </p>
                  <p className="text-sm text-red-800 mt-1">
                    {selectedClient.flagReason}
                  </p>
                  <p className="text-xs text-red-600 mt-2">
                    Flagged on:{" "}
                    {new Date(selectedClient.flaggedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Assigned Lawyers */}
            <div className="p-6 border-t border-gray-200">
              <h3 className="text-lg font-bold mb-4">
                Assigned Lawyers ({selectedClient.assignedLawyersCount})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedClient.assignedLawyers &&
                selectedClient.assignedLawyers.length > 0 ? (
                  selectedClient.assignedLawyers.map((lawyer) => (
                    <div
                      key={lawyer.lawyerId}
                      className="p-3 bg-gray-50 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {lawyer.lawyerName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {lawyer.specialization || "General Practice"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No lawyers assigned</p>
                )}
              </div>
            </div>

            {/* Enquiries */}
            <div className="p-6 border-t border-gray-200">
              <h3 className="text-lg font-bold mb-4">
                Recent Enquiries ({enquiries.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {enquiries.length > 0 ? (
                  enquiries.map((enquiry) => (
                    <div
                      key={enquiry.id}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <p className="text-sm">{enquiry.message}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        To: {enquiry.lawyerName} | Status:{" "}
                        <span
                          className={`font-medium ${
                            enquiry.enquiryStatus === 0 ||
                            enquiry.enquiryStatus === "Pending"
                              ? "text-yellow-600"
                              : enquiry.enquiryStatus === 1 ||
                                enquiry.enquiryStatus === "Accepted"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {enquiry.enquiryStatus === 0 ||
                          enquiry.enquiryStatus === "Pending"
                            ? "Pending"
                            : enquiry.enquiryStatus === 1 ||
                              enquiry.enquiryStatus === "Accepted"
                            ? "Accepted"
                            : "Rejected"}
                        </span>
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No enquiries found</p>
                )}
              </div>
            </div>

            {/* Consultations */}
            <div className="p-6 border-t border-gray-200">
              <h3 className="text-lg font-bold mb-4">
                Consultations ({consultations.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {consultations.length > 0 ? (
                  consultations.map((consultation) => (
                    <div
                      key={consultation.id}
                      className="p-3 bg-gray-50 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {consultation.title}
                        </p>
                        <p className="text-xs text-gray-600">
                          With: {consultation.lawyerName} |{" "}
                          {new Date(
                            consultation.scheduledDateTime
                          ).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          consultation.status === "Scheduled"
                            ? "bg-blue-100 text-blue-700"
                            : consultation.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {consultation.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No consultations found
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
