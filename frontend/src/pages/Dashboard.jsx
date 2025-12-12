import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Calendar, DollarSign, Star, Users } from 'lucide-react';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await usersAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const isCustomer = user?.user_type === 'customer';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-gray-600 mt-2">
            {isCustomer ? 'Manage your bookings and find artisans' : 'Manage your services and bookings'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isCustomer ? (
            <>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Pending Bookings</h3>
                <p className="text-3xl font-bold text-gray-900">{stats?.pending_bookings || 0}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Confirmed Bookings</h3>
                <p className="text-3xl font-bold text-gray-900">{stats?.confirmed_bookings || 0}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Completed</h3>
                <p className="text-3xl font-bold text-gray-900">{stats?.completed_bookings || 0}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Total Spent</h3>
                <p className="text-3xl font-bold text-gray-900">₦{stats?.total_spent || 0}</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Pending Bookings</h3>
                <p className="text-3xl font-bold text-gray-900">{stats?.pending_bookings || 0}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">In Progress</h3>
                <p className="text-3xl font-bold text-gray-900">{stats?.in_progress_bookings || 0}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Completed</h3>
                <p className="text-3xl font-bold text-gray-900">{stats?.completed_bookings || 0}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Total Earned</h3>
                <p className="text-3xl font-bold text-gray-900">₦{stats?.total_earned || 0}</p>
              </div>
            </>
          )}
        </div>

        {!isCustomer && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Star className="w-8 h-8 text-yellow-400 fill-current mr-2" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {stats?.rating ? parseFloat(stats.rating).toFixed(1) : 'N/A'}
                  </h3>
                  <p className="text-gray-600 text-sm">Your Rating</p>
                </div>
              </div>
              <p className="text-gray-600">{stats?.total_reviews || 0} total reviews</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  to="/profile"
                  className="block w-full text-left px-4 py-2 bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100"
                >
                  Update Profile
                </Link>
                <Link
                  to="/bookings"
                  className="block w-full text-left px-4 py-2 bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100"
                >
                  View Bookings
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Quick Links</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isCustomer ? (
              <>
                <Link
                  to="/search"
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">Find Artisans</h3>
                  <p className="text-sm text-gray-600">Search for skilled professionals near you</p>
                </Link>
                <Link
                  to="/bookings"
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">My Bookings</h3>
                  <p className="text-sm text-gray-600">View and manage your bookings</p>
                </Link>
                <Link
                  to="/profile"
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">Profile</h3>
                  <p className="text-sm text-gray-600">Update your personal information</p>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/bookings"
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">Manage Bookings</h3>
                  <p className="text-sm text-gray-600">View and update booking requests</p>
                </Link>
                <Link
                  to="/profile"
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">Update Profile</h3>
                  <p className="text-sm text-gray-600">Manage your artisan profile and services</p>
                </Link>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="font-semibold text-gray-900 mb-2">Get Verified</h3>
                  <p className="text-sm text-gray-600">Complete verification to get more bookings</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
