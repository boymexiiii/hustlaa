import React, { useState, useEffect } from 'react';
import { User, MapPin, Briefcase, DollarSign, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usersAPI, artisansAPI } from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });
  const [artisanData, setArtisanData] = useState({
    bio: '',
    skills: [],
    hourly_rate: '',
    availability_status: 'available',
  });
  const [locationData, setLocationData] = useState({
    state: '',
    city: '',
    address: '',
  });
  const [newSkill, setNewSkill] = useState('');
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: '',
  });
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [states, setStates] = useState([]);

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
      });
    }
    if (user?.user_type === 'artisan') {
      fetchStates();
    }
  }, [user]);

  const fetchStates = async () => {
    try {
      const response = await artisansAPI.getStates();
      setStates(response.data);
    } catch (error) {
      console.error('Failed to fetch states:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await usersAPI.updateProfile(profileData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleArtisanProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await artisansAPI.updateProfile(artisanData);
      toast.success('Artisan profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update artisan profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await artisansAPI.setLocation(locationData);
      toast.success('Location updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update location');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !artisanData.skills.includes(newSkill.trim())) {
      setArtisanData({
        ...artisanData,
        skills: [...artisanData.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setArtisanData({
      ...artisanData,
      skills: artisanData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await artisansAPI.addService(newService);
      toast.success('Service added successfully');
      setShowServiceModal(false);
      setNewService({ name: '', description: '', price: '', duration_minutes: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add service');
    } finally {
      setLoading(false);
    }
  };

  const isArtisan = user?.user_type === 'artisan';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center mb-6">
              <User className="w-6 h-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            </div>
            <form onSubmit={handleProfileUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={profileData.last_name}
                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        </div>

        {isArtisan && (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <Briefcase className="w-6 h-6 text-primary-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Artisan Profile</h2>
                </div>
                <form onSubmit={handleArtisanProfileUpdate}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={artisanData.bio}
                      onChange={(e) => setArtisanData({ ...artisanData, bio: e.target.value })}
                      placeholder="Tell customers about yourself and your experience..."
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill (e.g., Plumbing)"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {artisanData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 rounded-full"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-2 focus:outline-none"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hourly Rate (₦)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        value={artisanData.hourly_rate}
                        onChange={(e) => setArtisanData({ ...artisanData, hourly_rate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Availability Status
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        value={artisanData.availability_status}
                        onChange={(e) => setArtisanData({ ...artisanData, availability_status: e.target.value })}
                      >
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                        <option value="offline">Offline</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Artisan Profile'}
                  </button>
                </form>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <MapPin className="w-6 h-6 text-primary-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Location</h2>
                </div>
                <form onSubmit={handleLocationUpdate}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        value={locationData.state}
                        onChange={(e) => setLocationData({ ...locationData, state: e.target.value })}
                      >
                        <option value="">Select State</option>
                        {states.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        value={locationData.city}
                        onChange={(e) => setLocationData({ ...locationData, city: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={locationData.address}
                      onChange={(e) => setLocationData({ ...locationData, address: e.target.value })}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Location'}
                  </button>
                </form>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <DollarSign className="w-6 h-6 text-primary-600 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900">Services</h2>
                  </div>
                  <button
                    onClick={() => setShowServiceModal(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
                  >
                    <Plus className="w-5 h-5 mr-1" />
                    Add Service
                  </button>
                </div>
                <p className="text-gray-600">
                  Add services you offer to attract more customers
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {showServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Service</h2>
            <form onSubmit={handleAddService}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  placeholder="e.g., Pipe Installation"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  placeholder="Describe the service..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₦)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={newService.duration_minutes}
                    onChange={(e) => setNewService({ ...newService, duration_minutes: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Service'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
