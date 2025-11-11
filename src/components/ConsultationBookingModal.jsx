import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function ConsultationBookingModal({ lawyerId, lawyerName, onClose, onSuccess }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledDateTime: "",
    durationMinutes: 60,
    meetingLink: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Debug: Log user and lawyerId on mount
  console.log("ConsultationBookingModal - User:", user);
  console.log("ConsultationBookingModal - Lawyer ID:", lawyerId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted - handleSubmit called");
    
    if (!formData.title || !formData.scheduledDateTime) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate future date
    const selectedDate = new Date(formData.scheduledDateTime);
    const now = new Date();
    if (selectedDate <= now) {
      setError("Please select a future date and time");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Check if user is logged in
      if (!user || !user.id) {
        setError("You must be logged in to book a consultation");
        setLoading(false);
        return;
      }

      const payload = {
        clientId: user.id,
        lawyerId: parseInt(lawyerId),
        title: formData.title,
        description: formData.description || "",
        scheduledDateTime: new Date(formData.scheduledDateTime).toISOString(),
        durationMinutes: parseInt(formData.durationMinutes),
        meetingLink: formData.meetingLink || "",
        location: formData.location || "",
        status: "Scheduled",
      };

      console.log("Booking consultation with payload:", payload);
      const res = await api.post("/api/Consultation/create", payload);
      console.log("Consultation booking response:", res.data);

      if (res.data.statusCode === "200") {
        alert("Consultation booked successfully!");
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        setError(res.data.message || "Failed to book consultation");
      }
    } catch (err) {
      console.error("Error booking consultation:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      setError(err.response?.data?.message || err.response?.data?.Message || "Failed to book consultation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6 text-white sticky top-0 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Book Consultation</h2>
              <p className="text-sm text-white/90 mt-1">with {lawyerName}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Consultation Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Initial Legal Consultation"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what you'd like to discuss..."
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date and Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="scheduledDateTime"
                value={formData.scheduledDateTime}
                onChange={handleChange}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <select
                name="durationMinutes"
                value={formData.durationMinutes}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>
          </div>

          {/* Meeting Link */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Online Meeting Link (Optional)
            </label>
            <input
              type="url"
              name="meetingLink"
              value={formData.meetingLink}
              onChange={handleChange}
              placeholder="https://zoom.us/j/..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Physical Location (Optional)
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Law Office Address"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={(e) => {
                console.log("Book button clicked");
                console.log("Form data:", formData);
                console.log("User:", user);
              }}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Booking...
                </span>
              ) : (
                "Book Consultation"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
