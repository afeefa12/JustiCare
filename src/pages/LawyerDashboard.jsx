import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import ChatWindow from "../components/ChatWindow";
import NotificationBell from "../components/NotificationBell";

export default function LawyerDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("requests"); // "users", "requests", "cases", "consultations" or "about"
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState("");
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  
  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  
  // Case details modal state
  const [caseDetailsOpen, setCaseDetailsOpen] = useState(false);
  const [selectedClientDetails, setSelectedClientDetails] = useState(null);
  const [clientEnquiries, setClientEnquiries] = useState([]);
  
  // Cases tab state
  const [cases, setCases] = useState([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [casesError, setCasesError] = useState("");
  const [caseFormOpen, setCaseFormOpen] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [caseForm, setCaseForm] = useState({
    clientId: "",
    enquiryId: "",
    title: "",
    description: "",
    nextHearingDate: "",
    relatedDocuments: ""
  });
  
  // Consultations tab state
  const [consultations, setConsultations] = useState([]);
  const [consultationsLoading, setConsultationsLoading] = useState(false);
  const [consultationsError, setConsultationsError] = useState("");
  const [consultationFormOpen, setConsultationFormOpen] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [consultationForm, setConsultationForm] = useState({
    clientId: "",
    caseId: "",
    title: "",
    description: "",
    scheduledDateTime: "",
    durationMinutes: "60",
    meetingLink: "",
    location: ""
  });
  
  // Search and Filter state
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [requestStatusFilter, setRequestStatusFilter] = useState("All"); // All, Pending, Accepted, Rejected
  const [requestSearchTerm, setRequestSearchTerm] = useState("");
  
  // Stats state
  const [stats, setStats] = useState({
    activeClients: 0,
    upcomingAppointments: 0,
    totalConsultations: 0
  });

  // Fetch client requests from API
  useEffect(() => {
    const fetchRequests = async () => {
      if (activeTab !== "requests" || !user?.id) return;

      try {
        setRequestsLoading(true);
        setRequestsError("");
        const response = await api.get(`/api/Enquiry/lawyer/${user.id}`);
        
        const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
        setRequests(data);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setRequestsError(err.response?.data?.message || "Failed to load requests. Please try again.");
      } finally {
        setRequestsLoading(false);
      }
    };

    fetchRequests();
  }, [activeTab, user?.id]);

  // Fetch stats data
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      try {
        // Fetch all enquiries for this lawyer
        const response = await api.get(`/api/Enquiry/lawyer/${user.id}`);
        const enquiries = Array.isArray(response.data) ? response.data : response.data?.data || [];
        
        // Active Clients: Count unique clients with accepted status
        const activeClientIds = new Set(
          enquiries
            .filter(e => e.enquiryStatus === "Accepted" || e.enquiryStatus === 1)
            .map(e => e.clientId)
        );
        
        // Upcoming Appointments: Count pending enquiries
        const pendingCount = enquiries.filter(
          e => e.enquiryStatus === "Pending" || e.enquiryStatus === 0
        ).length;
        
        // Total Consultations: Count all accepted enquiries
        const totalAccepted = enquiries.filter(
          e => e.enquiryStatus === "Accepted" || e.enquiryStatus === 1
        ).length;
        
        setStats({
          activeClients: activeClientIds.size,
          upcomingAppointments: pendingCount,
          totalConsultations: totalAccepted
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
  }, [user?.id, requests]);

  // Fetch clients from API
  useEffect(() => {
    const fetchClients = async () => {
      if (activeTab !== "users") return;

      try {
        setClientsLoading(true);
        setClientsError("");
        const response = await api.get("/api/Clients");

        // Handle ApiResponse format or direct array
        let clientsData = [];
        if (Array.isArray(response.data)) {
          clientsData = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          clientsData = response.data.data;
        } else if (response.data?.statusCode === "200" && Array.isArray(response.data.data)) {
          clientsData = response.data.data;
        }

        // Fetch enquiries to get client engagement data
        let enquiriesData = [];
        if (user?.id) {
          try {
            const enquiriesResponse = await api.get(`/api/Enquiry/lawyer/${user.id}`);
            enquiriesData = Array.isArray(enquiriesResponse.data) 
              ? enquiriesResponse.data 
              : enquiriesResponse.data?.data || [];
          } catch (err) {
            console.warn("Could not fetch enquiries for clients", err);
          }
        }

        // Map role number to string and add enquiry info
        clientsData = clientsData.map((client) => {
          const clientEnquiries = enquiriesData.filter(e => e.clientId === client.id);
          const hasAccepted = clientEnquiries.some(e => e.enquiryStatus === "Accepted" || e.enquiryStatus === 1);
          const hasPending = clientEnquiries.some(e => e.enquiryStatus === "Pending" || e.enquiryStatus === 0);
          const latestEnquiry = clientEnquiries.length > 0 
            ? clientEnquiries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] 
            : null;

          return {
            ...client,
            roleName: client.role === 0 ? "Client" : client.role === 1 ? "Lawyer" : "Admin",
            status: hasAccepted ? "Active" : hasPending ? "Pending" : "Inactive",
            totalEnquiries: clientEnquiries.length,
            lastContact: latestEnquiry ? new Date(latestEnquiry.createdAt).toLocaleDateString() : "No contact",
            latestMessage: latestEnquiry?.message || "N/A"
          };
        });

        setClients(clientsData);
      } catch (err) {
        console.error("Error fetching clients:", err);
        setClientsError(err.response?.data?.message || "Failed to load clients. Please try again.");
      } finally {
        setClientsLoading(false);
      }
    };

    fetchClients();
  }, [activeTab, user?.id]);

  // Update request status
  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      await api.put(`/api/Enquiry/${id}/update-status`, null, {
        params: { status },
      });
      
      // Refresh requests and stats
      const response = await api.get(`/api/Enquiry/lawyer/${user.id}`);
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setRequests(data);
      
      // Update stats immediately
      const activeClientIds = new Set(
        data.filter(e => e.enquiryStatus === "Accepted" || e.enquiryStatus === 1).map(e => e.clientId)
      );
      const pendingCount = data.filter(e => e.enquiryStatus === "Pending" || e.enquiryStatus === 0).length;
      const totalAccepted = data.filter(e => e.enquiryStatus === "Accepted" || e.enquiryStatus === 1).length;
      
      setStats({
        activeClients: activeClientIds.size,
        upcomingAppointments: pendingCount,
        totalConsultations: totalAccepted
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Open chat with client
  const openChat = (client) => {
    setSelectedClient(client);
    setChatOpen(true);
  };

  // Open case details modal
  const openCaseDetails = async (client) => {
    setSelectedClientDetails(client);
    setCaseDetailsOpen(true);
    
    // Fetch all enquiries for this client
    try {
      const response = await api.get(`/api/Enquiry/lawyer/${user.id}`);
      const allEnquiries = Array.isArray(response.data) ? response.data : response.data?.data || [];
      const clientCases = allEnquiries.filter(e => e.clientId === client.id);
      setClientEnquiries(clientCases);
    } catch (err) {
      console.error("Error fetching client enquiries:", err);
      setClientEnquiries([]);
    }
  };

  // Fetch cases
  useEffect(() => {
    const fetchCases = async () => {
      if (activeTab !== "cases" || !user?.id) return;

      try {
        setCasesLoading(true);
        setCasesError("");
        const response = await api.get(`/api/Case/lawyer/${user.id}`);
        const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
        setCases(data);
      } catch (err) {
        console.error("Error fetching cases:", err);
        setCasesError(err.response?.data?.message || "Failed to load cases. Please try again.");
      } finally {
        setCasesLoading(false);
      }
    };

    fetchCases();
  }, [activeTab, user?.id]);

  // Handle case form submission
  const handleCaseSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCase) {
        // Update existing case
        await api.put(`/api/Case/${editingCase.id}`, {
          title: caseForm.title,
          description: caseForm.description,
          nextHearingDate: caseForm.nextHearingDate || null,
          relatedDocuments: caseForm.relatedDocuments || null
        });
      } else {
        // Create new case
        await api.post("/api/Case/create", {
          clientId: parseInt(caseForm.clientId),
          enquiryId: caseForm.enquiryId ? parseInt(caseForm.enquiryId) : null,
          title: caseForm.title,
          description: caseForm.description,
          nextHearingDate: caseForm.nextHearingDate || null,
          relatedDocuments: caseForm.relatedDocuments || null
        });
      }
      
      // Refresh cases list
      const response = await api.get(`/api/Case/lawyer/${user.id}`);
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setCases(data);
      
      // Reset form
      setCaseFormOpen(false);
      setEditingCase(null);
      setCaseForm({
        clientId: "",
        enquiryId: "",
        title: "",
        description: "",
        nextHearingDate: "",
        relatedDocuments: ""
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save case");
    }
  };

  // Open form for editing
  const openEditCase = (caseItem) => {
    setEditingCase(caseItem);
    setCaseForm({
      clientId: caseItem.clientId.toString(),
      enquiryId: caseItem.enquiryId?.toString() || "",
      title: caseItem.title,
      description: caseItem.description,
      nextHearingDate: caseItem.nextHearingDate ? new Date(caseItem.nextHearingDate).toISOString().split('T')[0] : "",
      relatedDocuments: caseItem.relatedDocuments || ""
    });
    setCaseFormOpen(true);
  };

  // Update case status
  const updateCaseStatus = async (id, status) => {
    try {
      await api.put(`/api/Case/${id}`, { status });
      const response = await api.get(`/api/Case/lawyer/${user.id}`);
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setCases(data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  // Close case
  const closeCase = async (id) => {
    if (!confirm("Are you sure you want to close this case?")) return;
    try {
      await api.patch(`/api/Case/${id}/close`);
      const response = await api.get(`/api/Case/lawyer/${user.id}`);
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setCases(data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to close case");
    }
  };

  // Delete case
  const deleteCase = async (id) => {
    if (!confirm("Are you sure you want to delete this case? This action cannot be undone.")) return;
    try {
      await api.delete(`/api/Case/${id}`);
      const response = await api.get(`/api/Case/lawyer/${user.id}`);
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setCases(data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete case");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ⚖️ LEGALEASE
              </h1>
              <p className="text-sm text-gray-600 mt-1">Lawyer Dashboard</p>
            </div>
            <NotificationBell />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab("requests")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === "requests"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="font-medium">Client Requests</span>
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === "users"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span className="font-medium">Users</span>
            </button>
            <button
              onClick={() => setActiveTab("cases")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === "cases"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="font-medium">Case Management</span>
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === "about"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">About</span>
            </button>
          </div>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="mb-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-sm font-semibold text-gray-900">{user?.username || "Lawyer"}</p>
            <p className="text-xs text-gray-600 truncate">{user?.email || "lawyer@example.com"}</p>
          </div>
          <button
            onClick={logout}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {user?.username || "Lawyer"} 👋
            </h1>
            <p className="text-gray-600">Manage your clients and consultations</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Active Clients</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.activeClients}</p>
                  <p className="text-xs text-gray-500 mt-1">Unique clients with accepted requests</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Pending Requests</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{stats.upcomingAppointments}</p>
                  <p className="text-xs text-gray-500 mt-1">Awaiting your response</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Consultations</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalConsultations}</p>
                  <p className="text-xs text-gray-500 mt-1">Accepted consultations</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          {activeTab === "requests" && (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Client Enquiries</h2>
                {requestsLoading && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Loading...</span>
                  </div>
                )}
              </div>

              {/* Search and Filter Bar */}
              <div className="mb-6 flex flex-wrap gap-4 items-center">
                {/* Search Input */}
                <div className="flex-1 min-w-[250px]">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search by client ID or message..."
                      value={requestSearchTerm}
                      onChange={(e) => setRequestSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Status Filter Buttons */}
                <div className="flex gap-2">
                  {["All", "Pending", "Accepted", "Rejected"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setRequestStatusFilter(filter)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        requestStatusFilter === filter
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {requestsError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <p className="text-red-600 text-sm text-center font-medium">{requestsError}</p>
                </div>
              )}

              {!requestsLoading && !requestsError && requests.length === 0 && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600 text-lg">No enquiries yet</p>
                  <p className="text-gray-500 text-sm mt-2">Client requests will appear here</p>
                </div>
              )}

              {!requestsLoading && requests.length > 0 && (() => {
                // Filter requests based on search term and status
                const filteredRequests = requests.filter((req) => {
                  // Status filter
                  const statusMatch = requestStatusFilter === "All" || 
                    (requestStatusFilter === "Pending" && (req.enquiryStatus === "Pending" || req.enquiryStatus === 0)) ||
                    (requestStatusFilter === "Accepted" && (req.enquiryStatus === "Accepted" || req.enquiryStatus === 1)) ||
                    (requestStatusFilter === "Rejected" && (req.enquiryStatus === "Rejected" || req.enquiryStatus === 2));
                  
                  // Search filter
                  const searchLower = requestSearchTerm.toLowerCase();
                  const searchMatch = !requestSearchTerm || 
                    req.clientId.toString().includes(searchLower) ||
                    req.message?.toLowerCase().includes(searchLower) ||
                    req.id?.toString().includes(searchLower);
                  
                  return statusMatch && searchMatch;
                });

                if (filteredRequests.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-gray-600 text-lg">No matching results</p>
                      <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or search term</p>
                    </div>
                  );
                }

                return (
                  <>
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
                          {filteredRequests.map((req) => (
                            <tr key={req.id || `${req.clientId}-${req.createdAt}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="py-3 px-4 text-gray-700">#{req.id || "—"}</td>
                              <td className="py-3 px-4 text-gray-700">{req.clientId}</td>
                              <td className="py-3 px-4 text-gray-700 max-w-md">
                                <p className="truncate">{req.message}</p>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  req.enquiryStatus === "Accepted" || req.enquiryStatus === 1
                                    ? "bg-green-100 text-green-700"
                                    : req.enquiryStatus === "Rejected" || req.enquiryStatus === 2
                                    ? "bg-red-100 text-red-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}>
                                  {typeof req.enquiryStatus === "number" 
                                    ? (req.enquiryStatus === 0 ? "Pending" : req.enquiryStatus === 1 ? "Accepted" : "Rejected")
                                    : req.enquiryStatus || "Pending"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-600">
                                {new Date(req.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => updateStatus(req.id, "Accepted")}
                                    disabled={updatingId === req.id || req.enquiryStatus === "Accepted" || req.enquiryStatus === 1}
                                    className="px-3 py-1 rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => updateStatus(req.id, "Rejected")}
                                    disabled={updatingId === req.id || req.enquiryStatus === "Rejected" || req.enquiryStatus === 2}
                                    className="px-3 py-1 rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                    <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Showing <span className="font-semibold text-gray-900">{filteredRequests.length}</span> of <span className="font-semibold text-gray-900">{requests.length}</span> requests
                      </p>
                      {requestStatusFilter !== "All" && (
                        <button
                          onClick={() => {
                            setRequestStatusFilter("All");
                            setRequestSearchTerm("");
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {activeTab === "users" && (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Client Directory</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage your client relationships</p>
                </div>
                {clientsLoading && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Loading...</span>
                  </div>
                )}
              </div>

              {/* Search Bar for Clients */}
              <div className="mb-6">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search clients by name or email..."
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  />
                  {clientSearchTerm && (
                    <button
                      onClick={() => setClientSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {clientsError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <p className="text-red-600 text-sm text-center font-medium">{clientsError}</p>
                </div>
              )}

              {!clientsLoading && !clientsError && clients.length === 0 && (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <p className="text-gray-600 text-lg">No clients found</p>
                  <p className="text-gray-500 text-sm mt-2">No clients have registered yet</p>
                </div>
              )}

              {!clientsLoading && clients.length > 0 && (() => {
                // Filter clients based on search term
                const filteredClients = clients.filter((client) => {
                  const searchLower = clientSearchTerm.toLowerCase();
                  return !clientSearchTerm || 
                    client.username?.toLowerCase().includes(searchLower) ||
                    client.email?.toLowerCase().includes(searchLower) ||
                    client.id?.toString().includes(searchLower);
                });

                if (filteredClients.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-gray-600 text-lg">No clients found</p>
                      <p className="text-gray-500 text-sm mt-2">Try a different search term</p>
                    </div>
                  );
                }

                return (
                <div className="space-y-4">
                  {/* Stats Summary */}
                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {filteredClients.filter(c => c.status === "Active").length}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Active Clients</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">
                        {filteredClients.filter(c => c.status === "Pending").length}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Pending Requests</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-600">
                        {filteredClients.reduce((sum, c) => sum + (c.totalEnquiries || 0), 0)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Total Enquiries</p>
                    </div>
                  </div>

                  {/* Client Cards */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {filteredClients.map((client) => (
                      <div
                        key={client.id}
                        className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 hover:border-blue-300 bg-white"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                              {client.username?.charAt(0).toUpperCase() || "C"}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg">{client.username}</h3>
                              <p className="text-sm text-gray-500">ID: #{client.id}</p>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              client.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : client.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {client.status}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2 text-sm">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-700 truncate">{client.email}</span>
                          </div>

                          <div className="flex items-center space-x-2 text-sm">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            <span className="text-gray-700">
                              {client.totalEnquiries || 0} {client.totalEnquiries === 1 ? "enquiry" : "enquiries"}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 text-sm">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-700">Last contact: {client.lastContact}</span>
                          </div>

                          {client.latestMessage && client.latestMessage !== "N/A" && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs text-gray-500 mb-1">Latest enquiry:</p>
                              <p className="text-sm text-gray-700 line-clamp-2">{client.latestMessage}</p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                          <button 
                            onClick={() => openCaseDetails(client)}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            View Cases
                          </button>
                          <button 
                            onClick={() => openChat(client)}
                            className="px-3 py-2 border border-blue-300 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                            title="Start Chat"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {clientSearchTerm ? (
                        <>
                          Showing <span className="font-semibold text-gray-900">{filteredClients.length}</span> of <span className="font-semibold text-gray-900">{clients.length}</span> clients
                        </>
                      ) : (
                        <>
                          Total Clients: <span className="font-semibold text-gray-900">{clients.length}</span>
                        </>
                      )}
                    </p>
                    {clientSearchTerm && (
                      <button
                        onClick={() => setClientSearchTerm("")}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </div>
                );
              })()}
            </div>
          )}

          {activeTab === "cases" && (
            <div className="space-y-6">
              {/* Header with Add Case Button */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Case Management</h2>
                    <p className="text-sm text-gray-600 mt-1">Manage all your legal cases</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingCase(null);
                      setCaseForm({
                        clientId: "",
                        enquiryId: "",
                        title: "",
                        description: "",
                        nextHearingDate: "",
                        relatedDocuments: ""
                      });
                      setCaseFormOpen(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-medium flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Case
                  </button>
                </div>
              </div>

              {/* Case Form Modal */}
              {caseFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold">{editingCase ? "Edit Case" : "Create New Case"}</h3>
                        <button onClick={() => setCaseFormOpen(false)} className="text-white hover:bg-white/20 rounded-full p-2">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <form onSubmit={handleCaseSubmit} className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Client ID *</label>
                        <input
                          type="number"
                          required
                          value={caseForm.clientId}
                          onChange={(e) => setCaseForm({...caseForm, clientId: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="Enter client ID"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Enquiry ID (Optional)</label>
                        <input
                          type="number"
                          value={caseForm.enquiryId}
                          onChange={(e) => setCaseForm({...caseForm, enquiryId: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="Link to existing enquiry"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Case Title *</label>
                        <input
                          type="text"
                          required
                          value={caseForm.title}
                          onChange={(e) => setCaseForm({...caseForm, title: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="e.g., Property Dispute - Smith vs. Johnson"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                        <textarea
                          required
                          rows={4}
                          value={caseForm.description}
                          onChange={(e) => setCaseForm({...caseForm, description: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="Detailed case description..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Next Hearing Date</label>
                        <input
                          type="date"
                          value={caseForm.nextHearingDate}
                          onChange={(e) => setCaseForm({...caseForm, nextHearingDate: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Related Documents</label>
                        <input
                          type="text"
                          value={caseForm.relatedDocuments}
                          onChange={(e) => setCaseForm({...caseForm, relatedDocuments: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="Document URLs or references (comma-separated)"
                        />
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button type="submit" className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-medium">
                          {editingCase ? "Update Case" : "Create Case"}
                        </button>
                        <button type="button" onClick={() => setCaseFormOpen(false)} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Cases List */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                {casesLoading && (
                  <div className="flex justify-center items-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {casesError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <p className="text-red-600 text-sm text-center font-medium">{casesError}</p>
                  </div>
                )}

                {!casesLoading && !casesError && cases.length === 0 && (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-600 text-lg">No cases yet</p>
                    <p className="text-gray-500 text-sm mt-2">Click "Add New Case" to create your first case</p>
                  </div>
                )}

                {!casesLoading && cases.length > 0 && (
                  <div className="space-y-4">
                    {cases.map((caseItem) => (
                      <div key={caseItem.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">{caseItem.title}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                caseItem.status === "Open" ? "bg-blue-100 text-blue-700" :
                                caseItem.status === "Ongoing" ? "bg-yellow-100 text-yellow-700" :
                                "bg-gray-100 text-gray-700"
                              }`}>
                                {caseItem.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Case #{caseItem.id}</span>
                              <span>•</span>
                              <span>Client: {caseItem.clientName || `ID: ${caseItem.clientId}`}</span>
                              {caseItem.clientEmail && (
                                <>
                                  <span>•</span>
                                  <span>{caseItem.clientEmail}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4">{caseItem.description}</p>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-600">
                              Created: {new Date(caseItem.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {caseItem.nextHearingDate && (
                            <div className="flex items-center gap-2 text-sm">
                              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-orange-600 font-medium">
                                Hearing: {new Date(caseItem.nextHearingDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {caseItem.relatedDocuments && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs font-semibold text-gray-600 mb-1">Documents:</p>
                            <p className="text-sm text-gray-700 truncate">{caseItem.relatedDocuments}</p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => openEditCase(caseItem)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                          >
                            Edit
                          </button>
                          {caseItem.status !== "Ongoing" && (
                            <button
                              onClick={() => updateCaseStatus(caseItem.id, "Ongoing")}
                              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
                            >
                              Mark as Ongoing
                            </button>
                          )}
                          {caseItem.status !== "Closed" && (
                            <button
                              onClick={() => closeCase(caseItem.id)}
                              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
                            >
                              Close Case
                            </button>
                          )}
                          <button
                            onClick={() => deleteCase(caseItem.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!casesLoading && cases.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Total Cases: <span className="font-semibold text-gray-900">{cases.length}</span>
                    </p>
                    <div className="flex gap-4 text-sm">
                      <span className="text-blue-600 font-medium">Open: {cases.filter(c => c.status === "Open").length}</span>
                      <span className="text-yellow-600 font-medium">Ongoing: {cases.filter(c => c.status === "Ongoing").length}</span>
                      <span className="text-gray-600 font-medium">Closed: {cases.filter(c => c.status === "Closed").length}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Platform Overview</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Welcome to LEGALEASE, a comprehensive lawyer service booking platform designed to
                    connect clients with qualified legal professionals. Our platform facilitates seamless
                    communication, appointment scheduling, and case management.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Features</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Secure client-lawyer communication</li>
                    <li>Efficient appointment booking system</li>
                    <li>Real-time case status updates</li>
                    <li>Document sharing and management</li>
                    <li>Comprehensive dashboard analytics</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Your Role</h3>
                  <p className="text-gray-600 leading-relaxed">
                    As a lawyer on this platform, you can manage your client relationships, schedule
                    consultations, track your appointments, and maintain a professional profile. Use
                    the sidebar to navigate between different sections of your dashboard.
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Need Help?</strong> Contact our support team at{" "}
                    <a href="mailto:support@legalease.com" className="underline">
                      support@legalease.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      {chatOpen && selectedClient && (
        <ChatWindow
          receiverId={selectedClient.id}
          receiverName={selectedClient.username}
          onClose={() => setChatOpen(false)}
        />
      )}

      {/* Case Details Modal */}
      {caseDetailsOpen && selectedClientDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                    {selectedClientDetails.username?.charAt(0).toUpperCase() || "C"}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedClientDetails.username}</h2>
                    <p className="text-white/80 text-sm">Client ID: #{selectedClientDetails.id}</p>
                    <p className="text-white/80 text-sm">{selectedClientDetails.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setCaseDetailsOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Client Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{clientEnquiries.length}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Cases</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {clientEnquiries.filter(e => e.enquiryStatus === "Accepted" || e.enquiryStatus === 1).length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Accepted</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {clientEnquiries.filter(e => e.enquiryStatus === "Pending" || e.enquiryStatus === 0).length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Pending</p>
                </div>
              </div>

              {/* Case List */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Case History</h3>
                {clientEnquiries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No cases found for this client</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clientEnquiries.map((enquiry, index) => (
                      <div key={enquiry.id || index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-semibold text-gray-700">Case #{enquiry.id || index + 1}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                enquiry.enquiryStatus === "Accepted" || enquiry.enquiryStatus === 1
                                  ? "bg-green-100 text-green-700"
                                  : enquiry.enquiryStatus === "Rejected" || enquiry.enquiryStatus === 2
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}>
                                {typeof enquiry.enquiryStatus === "number" 
                                  ? (enquiry.enquiryStatus === 0 ? "Pending" : enquiry.enquiryStatus === 1 ? "Accepted" : "Rejected")
                                  : enquiry.enquiryStatus || "Pending"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              <strong>Filed:</strong> {new Date(enquiry.createdAt).toLocaleDateString()} at {new Date(enquiry.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Case Description:</p>
                          <p className="text-sm text-gray-600">{enquiry.message}</p>
                        </div>
                        {(enquiry.enquiryStatus === "Pending" || enquiry.enquiryStatus === 0) && (
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => {
                                updateStatus(enquiry.id, "Accepted");
                                setTimeout(() => openCaseDetails(selectedClientDetails), 500);
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                            >
                              Accept Case
                            </button>
                            <button
                              onClick={() => {
                                updateStatus(enquiry.id, "Rejected");
                                setTimeout(() => openCaseDetails(selectedClientDetails), 500);
                              }}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                            >
                              Reject Case
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setCaseDetailsOpen(false);
                    openChat(selectedClientDetails);
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  💬 Start Chat
                </button>
                <button
                  onClick={() => setCaseDetailsOpen(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
