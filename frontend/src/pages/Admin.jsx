import React, { useState, useEffect } from 'react';
import { Users, Briefcase, CheckCircle, XCircle, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    if (activeTab === 'verifications') {
      fetchPendingVerifications();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingVerifications = async () => {
    try {
      const response = await adminAPI.getPendingVerifications();
      setPendingVerifications(response.data);
    } catch (error) {
      toast.error('Failed to fetch pending verifications');
    }
  };

  const handleVerification = async (artisanId, status) => {
    try {
      await adminAPI.verifyArtisan(artisanId, { status });
      toast.success(`Artisan ${status} successfully`);
      fetchPendingVerifications();
      fetchStats();
    } catch (error) {
      toast.error(`Failed to ${status} artisan`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-primary-100 mt-2">Manage platform operations</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('verifications')}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap ${
              activeTab === 'verifications'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Verifications ({stats?.pending_verifications || 0})
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Total Customers</h3>
                <p className="text-3xl font-bold text-gray-900">{stats?.total_customers || 0}</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Total Artisans</h3>
                <p className="text-3xl font-bold text-gray-900">{stats?.total_artisans || 0}</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Total Bookings</h3>
                <p className="text-3xl font-bold text-gray-900">{stats?.total_bookings || 0}</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Total Revenue</h3>
                <p className="text-3xl font-bold text-gray-900">₦{stats?.total_revenue || 0}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Platform Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Verified Artisans</span>
                    <span className="font-semibold text-green-600">{stats?.verified_artisans || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Pending Verifications</span>
                    <span className="font-semibold text-yellow-600">{stats?.pending_verifications || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Completed Bookings</span>
                    <span className="font-semibold text-blue-600">{stats?.completed_bookings || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('verifications')}
                    className="w-full bg-primary-50 text-primary-700 hover:bg-primary-100 px-4 py-3 rounded-lg font-semibold text-left"
                  >
                    Review Pending Verifications
                  </button>
                  <button className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-3 rounded-lg font-semibold text-left">
                    View All Users
                  </button>
                  <button className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-3 rounded-lg font-semibold text-left">
                    View All Bookings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'verifications' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Artisan Verifications</h2>
            {pendingVerifications.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-600">No pending verifications at the moment.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingVerifications.map((artisan) => (
                  <div key={artisan.artisan_id} className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-start gap-6">
                      <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-2xl font-bold text-primary-600 flex-shrink-0">
                        {artisan.first_name?.[0]}{artisan.last_name?.[0]}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {artisan.first_name} {artisan.last_name}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium">{artisan.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Phone</p>
                            <p className="font-medium">{artisan.phone}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Location</p>
                            <p className="font-medium">{artisan.city}, {artisan.state}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Hourly Rate</p>
                            <p className="font-medium">₦{artisan.hourly_rate || 'Not set'}</p>
                          </div>
                        </div>

                        {artisan.bio && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-1">Bio</p>
                            <p className="text-gray-700">{artisan.bio}</p>
                          </div>
                        )}

                        {artisan.skills && artisan.skills.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {artisan.skills.map((skill, idx) => (
                                <span key={idx} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-4 mt-6">
                          <button
                            onClick={() => handleVerification(artisan.artisan_id, 'verified')}
                            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold"
                          >
                            <CheckCircle className="w-5 h-5" />
                            Verify
                          </button>
                          <button
                            onClick={() => handleVerification(artisan.artisan_id, 'rejected')}
                            className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold"
                          >
                            <XCircle className="w-5 h-5" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
