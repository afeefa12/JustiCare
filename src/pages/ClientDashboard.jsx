import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import LawyerCard from "../components/LawyerCard";

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const [lawyers, setLawyers] = useState([]);
  const [filteredLawyers, setFilteredLawyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("all");
  const [stats, setStats] = useState({
    consultationsBooked: 0,
    pendingResponses: 0,
    completedSessions: 0,
  });

  // Fetch lawyers from API
  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/api/Lawyer");

        // Handle ApiResponse format or direct array
        let lawyersData = [];
        if (Array.isArray(response.data)) {
          lawyersData = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          lawyersData = response.data.data;
        } else if (response.data?.statusCode === "200" && Array.isArray(response.data.data)) {
          lawyersData = response.data.data;
        }

        lawyersData = lawyersData.map((lawyer, index) => ({
          ...lawyer,
          id: lawyer.id || index + 1,
        }));

        setLawyers(lawyersData);
        setFilteredLawyers(lawyersData);
      } catch (err) {
        console.error("Error fetching lawyers:", err);
        setError(err.response?.data?.message || "Failed to load lawyers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const fetchClientStats = async () => {
      if (!user?.id) return;
      
      try {
        // Fetch consultations
        const consultRes = await api.get(`/api/Consultation/client/${user.id}`);
        const consultations = consultRes.data?.data || [];
        
        // Fetch enquiries
        const enquiryRes = await api.get(`/api/Enquiry/client/${user.id}`);
        const enquiries = enquiryRes.data?.data || [];

        setStats({
          consultationsBooked: consultations.filter(c => c.status === "Scheduled").length,
          pendingResponses: enquiries.filter(e => e.enquiryStatus === "Pending" || e.enquiryStatus === 0).length,
          completedSessions: consultations.filter(c => c.status === "Completed").length,
        });
      } catch (err) {
        console.error("Error fetching client stats:", err);
      }
    };

    fetchLawyers();
    fetchClientStats();
  }, [user?.id]);

  // Filter lawyers by specialization
  useEffect(() => {
    if (selectedSpecialization === "all") {
      setFilteredLawyers(lawyers);
    } else {
      setFilteredLawyers(
        lawyers.filter(
          (lawyer) =>
            lawyer.specialization &&
            lawyer.specialization.toLowerCase().includes(selectedSpecialization.toLowerCase())
        )
      );
    }
  }, [selectedSpecialization, lawyers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-purple-700 mb-1">
                👋 Welcome, {user?.username || "Client"}
              </h1>
              <p className="text-gray-600">Browse and book consultations with expert lawyers</p>
            </div>
            <button
              onClick={logout}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Consultations Booked</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.consultationsBooked}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pending Responses</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.pendingResponses}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Completed Sessions</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.completedSessions}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Available Lawyers Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Available Lawyers</h2>
              <p className="text-gray-600 text-sm mt-1">Browse our network of expert legal professionals</p>
            </div>
            {loading && (
              <div className="flex items-center space-x-2 text-gray-600">
                <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Loading...</span>
              </div>
            )}
          </div>

          {/* Filter by Specialization */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Specialization
            </label>
            <div className="flex flex-wrap gap-2">
              {["all", "criminal", "family", "property", "corporate", "civil"].map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialization(spec)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedSpecialization === spec
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {spec.charAt(0).toUpperCase() + spec.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-600 text-sm text-center font-medium">{error}</p>
            </div>
          )}

          {!loading && !error && filteredLawyers.length === 0 && (
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-600 text-lg">
                {selectedSpecialization === "all" 
                  ? "No lawyers available at the moment"
                  : `No ${selectedSpecialization} lawyers found`}
              </p>
              <p className="text-gray-500 text-sm mt-2">Try selecting a different specialization</p>
            </div>
          )}

          {!loading && filteredLawyers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLawyers.map((lawyer) => (
                <LawyerCard key={lawyer.id} lawyer={lawyer} showActions={true} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Info Section */}
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl shadow-md border border-purple-200 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">📋 Quick Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
              <p className="text-sm font-semibold text-gray-700 mb-1">Total Lawyers Available</p>
              <p className="text-2xl font-bold text-purple-700">{filteredLawyers.length}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
              <p className="text-sm font-semibold text-gray-700 mb-1">Need Help?</p>
              <p className="text-sm text-gray-600">Contact support for booking assistance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
