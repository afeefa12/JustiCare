import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminLawyers() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [consultations, setConsultations] = useState([]);
  const [enquiries, setEnquiries] = useState([]);

  // Form states
  const [editForm, setEditForm] = useState({
    specialization: "",
    experienceYears: "",
    phoneNumber: "",
    address: "",
    consultationFee: "",
    credentials: "",
    languages: "",
    isAvailable: true,
  });

  useEffect(() => {
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/Admin/lawyers");
      if (res.data.statusCode === "200") {
        setLawyers(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching lawyers:", error);
      alert("Failed to fetch lawyers");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationStatus = async (lawyerId, status) => {
    try {
      const res = await api.patch(`/api/Admin/lawyers/${lawyerId}/verification`, {
        status,
      });
      if (res.data.statusCode === "200") {
        alert(`Lawyer ${status.toLowerCase()} successfully`);
        fetchLawyers(); // Refresh list
      }
    } catch (error) {
      console.error("Error updating verification:", error);
      alert("Failed to update lawyer status");
    }
  };

  const handleEditLawyer = async () => {
    try {
      const res = await api.put(`/api/Admin/lawyers/${selectedLawyer.id}`, editForm);
      if (res.data.statusCode === "200") {
        alert("Lawyer updated successfully");
        setShowEditModal(false);
        fetchLawyers();
      }
    } catch (error) {
      console.error("Error updating lawyer:", error);
      alert("Failed to update lawyer");
    }
  };

  const openEditModal = (lawyer) => {
    setSelectedLawyer(lawyer);
    setEditForm({
      specialization: lawyer.specialization || "",
      experienceYears: lawyer.experienceYears || "",
      phoneNumber: lawyer.phoneNumber || "",
      address: "",
      consultationFee: "",
      credentials: "",
      languages: "",
      isAvailable: lawyer.isAvailable ?? true,
    });
    setShowEditModal(true);
  };

  const openDetailsModal = async (lawyer) => {
    setSelectedLawyer(lawyer);
    setShowDetailsModal(true);
    
    // Fetch consultations and enquiries
    try {
      const [consultRes, enquiryRes] = await Promise.all([
        api.get(`/api/Admin/lawyers/${lawyer.id}/consultations`),
        api.get(`/api/Admin/lawyers/${lawyer.id}/enquiries`),
      ]);
      
      if (consultRes.data.statusCode === "200") {
        setConsultations(consultRes.data.data);
      }
      if (enquiryRes.data.statusCode === "200") {
        setEnquiries(enquiryRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching lawyer details:", error);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800",
      Approved: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
      Suspended: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Filter lawyers
  const filteredLawyers = lawyers.filter((lawyer) => {
    const matchesSearch =
      lawyer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lawyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lawyer.specialization?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "All" || lawyer.verificationStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-700">Loading lawyers...</div>
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
              Lawyer Management
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
                placeholder="Search by name, email, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {["All", "Pending", "Approved", "Rejected", "Suspended"].map((status) => (
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
            Showing {filteredLawyers.length} of {lawyers.length} lawyers
          </p>
        </div>

        {/* Lawyers Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Specialization</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Experience</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Clients</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Rating</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLawyers.map((lawyer) => (
                  <tr key={lawyer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {lawyer.username}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lawyer.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {lawyer.specialization || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {lawyer.experienceYears || 0} years
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {lawyer.totalClients}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          lawyer.verificationStatus
                        )}`}
                      >
                        {lawyer.verificationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      ⭐ {lawyer.rating?.toFixed(1) || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => openDetailsModal(lawyer)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openEditModal(lawyer)}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-xs font-medium"
                        >
                          Edit
                        </button>
                        {lawyer.verificationStatus === "Pending" && (
                          <>
                            <button
                              onClick={() => handleVerificationStatus(lawyer.id, "Approved")}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs font-medium"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleVerificationStatus(lawyer.id, "Rejected")}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {lawyer.verificationStatus === "Approved" && (
                          <button
                            onClick={() => handleVerificationStatus(lawyer.id, "Suspended")}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium"
                          >
                            Suspend
                          </button>
                        )}
                        {lawyer.verificationStatus === "Suspended" && (
                          <button
                            onClick={() => handleVerificationStatus(lawyer.id, "Approved")}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs font-medium"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLawyers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No lawyers found</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedLawyer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                Edit Lawyer: {selectedLawyer.username}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={editForm.specialization}
                    onChange={(e) =>
                      setEditForm({ ...editForm, specialization: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    value={editForm.experienceYears}
                    onChange={(e) =>
                      setEditForm({ ...editForm, experienceYears: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editForm.phoneNumber}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phoneNumber: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consultation Fee
                  </label>
                  <input
                    type="number"
                    value={editForm.consultationFee}
                    onChange={(e) =>
                      setEditForm({ ...editForm, consultationFee: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Languages
                  </label>
                  <input
                    type="text"
                    value={editForm.languages}
                    onChange={(e) =>
                      setEditForm({ ...editForm, languages: e.target.value })
                    }
                    placeholder="e.g., English, Spanish, Hindi"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.isAvailable}
                      onChange={(e) =>
                        setEditForm({ ...editForm, isAvailable: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Available for consultations
                    </span>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditLawyer}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedLawyer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
              <h2 className="text-2xl font-bold text-white">
                {selectedLawyer.username} - Profile Details
              </h2>
            </div>
            
            {/* Profile Info */}
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Email</p>
                  <p className="text-sm font-medium">{selectedLawyer.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Bar Registration</p>
                  <p className="text-sm font-medium">{selectedLawyer.barRegistrationNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Phone</p>
                  <p className="text-sm font-medium">{selectedLawyer.phoneNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Specialization</p>
                  <p className="text-sm font-medium">{selectedLawyer.specialization || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Experience</p>
                  <p className="text-sm font-medium">{selectedLawyer.experienceYears || 0} years</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Rating</p>
                  <p className="text-sm font-medium">⭐ {selectedLawyer.rating?.toFixed(1) || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Total Clients</p>
                  <p className="text-sm font-medium">{selectedLawyer.totalClients}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Cases Resolved</p>
                  <p className="text-sm font-medium">{selectedLawyer.casesResolved || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Total Consultations</p>
                  <p className="text-sm font-medium">{selectedLawyer.totalConsultations}</p>
                </div>
              </div>
            </div>

            {/* Consultations */}
            <div className="p-6 border-t border-gray-200">
              <h3 className="text-lg font-bold mb-4">Recent Consultations ({consultations.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {consultations.length > 0 ? (
                  consultations.map((consultation) => (
                    <div
                      key={consultation.id}
                      className="p-3 bg-gray-50 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-sm">{consultation.title}</p>
                        <p className="text-xs text-gray-600">
                          Client: {consultation.clientName} | {new Date(consultation.scheduledDateTime).toLocaleString()}
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
                  <p className="text-sm text-gray-500">No consultations found</p>
                )}
              </div>
            </div>

            {/* Enquiries */}
            <div className="p-6 border-t border-gray-200">
              <h3 className="text-lg font-bold mb-4">Recent Enquiries ({enquiries.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {enquiries.length > 0 ? (
                  enquiries.map((enquiry) => (
                    <div
                      key={enquiry.id}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <p className="text-sm">{enquiry.message}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Client ID: {enquiry.clientId} | Status:{" "}
                        <span
                          className={`font-medium ${
                            enquiry.enquiryStatus === 0 || enquiry.enquiryStatus === "Pending"
                              ? "text-yellow-600"
                              : enquiry.enquiryStatus === 1 || enquiry.enquiryStatus === "Accepted"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {enquiry.enquiryStatus === 0 || enquiry.enquiryStatus === "Pending"
                            ? "Pending"
                            : enquiry.enquiryStatus === 1 || enquiry.enquiryStatus === "Accepted"
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
