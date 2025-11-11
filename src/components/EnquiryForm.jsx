import React, { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function EnquiryForm({ lawyerId, onSuccess }) {
  const { user } = useAuth();
  const [caseDescription, setCaseDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!user?.id) {
      setError("You must be logged in as a client to send an enquiry.");
      return;
    }
    if (!lawyerId) {
      setError("Invalid lawyer.");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        userid: user.id,
        Lawyerid: Number(lawyerId),
        CaseDescription: caseDescription,
      };
      const res = await api.post("/api/Enquiry/create", payload);
      if (res.data?.data) {
        setSuccess("Request sent successfully!");
        setCaseDescription("");
        if (onSuccess) {
          setTimeout(() => onSuccess(), 1500);
        }
      } else {
        setSuccess("Request sent successfully!");
        if (onSuccess) {
          setTimeout(() => onSuccess(), 1500);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to send enquiry";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Send an Enquiry</h3>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Case Description</label>
          <textarea
            value={caseDescription}
            onChange={(e) => setCaseDescription(e.target.value)}
            rows={4}
            required
            placeholder="Briefly describe your case or request"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Enquiry"}
        </button>
      </form>
    </div>
  );
}


