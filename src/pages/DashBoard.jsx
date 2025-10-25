// src/pages/InvestorDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// import IdeaCard from '../components/Investor/IdeaCard';
// import InvestorSidebar from '../components/Investor/InvestorSidebar';
// import ChatModal from '../components/Investor/ChatModal';
// import { investorService } from '../Services/InvestorServices';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [ideas, setIdeas] = useState([]);
  const [filteredIdeas, setFilteredIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [selectedEntrepreneur, setSelectedEntrepreneur] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    loadIdeas();
  }, [activeTab]);

  useEffect(() => {
    filterIdeas();
  }, [ideas, activeTab, searchTerm, selectedCategory]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadIdeas = async () => {
    try {
      setLoading(true);
      setError('');
      let response;

      switch (activeTab) {
        case 'liked':
          response = await investorService.getLikedIdeas();
          break;
        case 'saved':
          response = await investorService.getSavedIdeas();
          break;
        default:
          response = await investorService.getAllIdeas();
          break;
      }

      const dataArray = response.data?.data || [];
      setIdeas(dataArray);
    } catch (err) {
      console.error('Error loading ideas:', err);
      setError('Failed to load ideas. Please try again.');
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  };

  const filterIdeas = () => {
    let filtered = Array.isArray(ideas) ? [...ideas] : [];

    if (searchTerm) {
      filtered = filtered.filter(
        idea =>
          idea.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          idea.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          idea.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(idea => idea.category === selectedCategory);
    }

    setFilteredIdeas(filtered);
  };

  const handleLike = async (ideaId) => {
    try {
      const idea = ideas.find(i => i.id === ideaId);
      if (idea?.isLiked) {
        await investorService.unlikeIdea(ideaId);
      } else {
        await investorService.likeIdea(ideaId);
      }
      await loadIdeas();
    } catch (err) {
      console.error('Error updating like:', err);
      setError('Failed to update like status.');
    }
  };

  const handleSave = async (ideaId) => {
    try {
      const idea = ideas.find(i => i.id === ideaId);
      if (idea?.isSaved) {
        await investorService.unsaveIdea(ideaId);
      } else {
        await investorService.saveIdea(ideaId);
      }
      await loadIdeas();
    } catch (err) {
      console.error('Error updating save:', err);
      setError('Failed to update save status.');
    }
  };

  const handleChat = (entrepreneur) => {
    setSelectedEntrepreneur(entrepreneur);
    setChatModalOpen(true);
  };

  const handleSearchByCategory = async (category) => {
    try {
      setLoading(true);
      setError('');
      const response = await investorService.searchIdeasByCategory(category);
      const dataArray = response.data?.data || [];
      setIdeas(dataArray);
      setSelectedCategory(category);
    } catch (err) {
      console.error('Error searching by category:', err);
      setError('Failed to search ideas.');
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(ideas.map(idea => idea.category).filter(Boolean)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex">
        {/* Full Height Sidebar */}
        <InvestorSidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onCategorySearch={handleSearchByCategory}
          onReload={loadIdeas}
          user={user}
        />

        <div className="flex-1 lg:ml-1 min-h-screen flex flex-col">
          {/* Top Navigation Bar */}
          <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="px-6 py-3">
              <div className="flex items-center justify-between">
                {/* Search Input */}
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search ideas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                    />
                  </div>
                </div>

                {/* User Profile & Dropdown */}
                <div className="ml-4 relative" ref={dropdownRef}>
                  <button
                    className="flex items-center space-x-2 focus:outline-none"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs shadow">
                      {user?.name?.charAt(0)?.toUpperCase() || 'I'}
                    </div>
                    <div className="hidden md:block text-right">
                      <p className="text-sm font-medium text-gray-900">{user?.username || 'Investor'}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.username?.charAt(0)?.toUpperCase() || 'Investor'}</p>
                    </div>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <button
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          logout();           // clears user session
                          navigate("/login"); // redirects to login page
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Opportunities</h1>
              <p className="text-gray-600 text-lg">
                Discover innovative ideas and connect with visionary entrepreneurs
              </p>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                {/* Total Ideas */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Ideas</p>
                      <p className="text-2xl font-bold text-gray-900">{ideas.length}</p>
                    </div>
                  </div>
                </div>

                {/* Liked */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Liked</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {ideas.filter(idea => idea.isLiked).length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Saved */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Saved</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {ideas.filter(idea => idea.isSaved).length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Categories</p>
                      <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            {/* Content Grid */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading investment opportunities...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {(filteredIdeas || []).map(idea => (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      onLike={handleLike}
                      onSave={handleSave}
                      onChat={handleChat}
                    />
                  ))}
                </div>

                {(!filteredIdeas || filteredIdeas.length === 0) && !loading && (
                  <div className="text-center py-16">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 max-w-md mx-auto">
                      <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No ideas found</h3>
                      <p className="text-gray-600 mb-4">
                        {activeTab !== 'all' 
                          ? `You haven't ${activeTab} any ideas yet.` 
                          : searchTerm || selectedCategory 
                            ? 'Try adjusting your search criteria.' 
                            : 'No ideas available at the moment.'}
                      </p>
                      {(searchTerm || selectedCategory) && (
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedCategory('');
                          }}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      <ChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        entrepreneur={selectedEntrepreneur}
      />
    </div>
  );
}