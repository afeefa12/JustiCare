import React from "react";
import { Link } from "react-router-dom";

/**
 * Reusable Lawyer Card Component
 * Displays a lawyer's information in a card format
 * 
 * @param {Object} lawyer - Lawyer object with name, specialization, experienceYears, rating, etc.
 * @param {string|number} lawyer.id - Lawyer ID for navigation
 * @param {string} lawyer.name - Lawyer name
 * @param {string} lawyer.specialization - Lawyer specialization
 * @param {number} lawyer.experienceYears - Years of experience
 * @param {string|number} lawyer.rating - Lawyer rating
 * @param {number} lawyer.totalRatings - Total number of ratings
 * @param {number} lawyer.consultationFee - Consultation fee
 * @param {string} lawyer.profileImageUrl - Optional profile image URL
 * @param {boolean} lawyer.isAvailable - Availability status
 * @param {boolean} showActions - Whether to show action buttons (default: true)
 */
export default function LawyerCard({ lawyer, showActions = true }) {
  if (!lawyer) return null;

  const renderStars = (rating) => {
    const numRating = parseFloat(rating) || 0;
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center space-x-1">
        {[...Array(fullStars)].map((_, i) => (
          <svg
            key={`full-${i}`}
            className="w-4 h-4 text-yellow-400 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <defs>
              <linearGradient id={`half-fill-${lawyer.id}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#half-fill-${lawyer.id})`}
              d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
            />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg
            key={`empty-${i}`}
            className="w-4 h-4 text-gray-300 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
        {numRating > 0 && (
          <span className="ml-1 text-sm text-gray-600">
            {numRating.toFixed(1)} ({lawyer.totalRatings || 0})
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
      {/* Card Header with Image or Initial */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
        <div className="flex items-center space-x-4">
          {lawyer.profileImageUrl ? (
            <img
              src={lawyer.profileImageUrl}
              alt={lawyer.name}
              className="w-16 h-16 rounded-full object-cover border-4 border-white/30"
            />
          ) : (
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-sm border-4 border-white/30">
              {lawyer.name?.charAt(0).toUpperCase() || "L"}
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">{lawyer.name || "Lawyer Name"}</h3>
            {lawyer.specialization && (
              <p className="text-sm text-white/90">{lawyer.specialization}</p>
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">
        {/* Rating */}
        {lawyer.rating !== undefined && lawyer.rating !== null && (
          <div className="mb-4">
            {renderStars(lawyer.rating)}
          </div>
        )}

        {/* Experience */}
        {lawyer.experienceYears > 0 && (
          <div className="mb-4 flex items-center text-gray-600">
            <svg
              className="w-5 h-5 mr-2 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm">
              {lawyer.experienceYears} {lawyer.experienceYears === 1 ? "Year" : "Years"} Experience
            </span>
          </div>
        )}

        {/* Consultation Fee */}
        {lawyer.consultationFee > 0 && (
          <div className="mb-4 flex items-center text-gray-600">
            <svg
              className="w-5 h-5 mr-2 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-semibold text-green-700">
              ${lawyer.consultationFee}
            </span>
          </div>
        )}

        {/* Availability Status */}
        {lawyer.isAvailable !== undefined && (
          <div className="mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              lawyer.isAvailable 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <span className={`w-2 h-2 mr-2 rounded-full ${
                lawyer.isAvailable ? 'bg-green-600' : 'bg-red-600'
              }`}></span>
              {lawyer.isAvailable ? 'Available' : 'Busy'}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && lawyer.id && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Link
              to={`/lawyer/${lawyer.id}`}
              className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-md transition-all duration-200"
            >
              View Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

