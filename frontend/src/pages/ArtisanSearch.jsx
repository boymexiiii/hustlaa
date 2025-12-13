import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Star, Filter, ChevronDown } from 'lucide-react';
import { artisansAPI } from '../services/api';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';

const ArtisanSearch = () => {
  const [searchParams] = useSearchParams();
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    state: searchParams.get('state') || '',
    city: searchParams.get('city') || '',
    skill: searchParams.get('skill') || '',
    rating: searchParams.get('rating') || '',
  });

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    fetchArtisans();
  }, [filters]);

  const fetchStates = async () => {
    try {
      const response = await artisansAPI.getStates();
      setStates(response.data);
    } catch (error) {
      console.error('Failed to fetch states:', error);
    }
  };

  const fetchArtisans = async () => {
    setLoading(true);
    try {
      const response = await artisansAPI.getAll(filters);
      setArtisans(response.data);
    } catch (error) {
      toast.error('Failed to fetch artisans');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchArtisans();
  };

  const handleReset = () => {
    setFilters({ state: '', city: '', skill: '', rating: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Artisans</h1>
          
          <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <select
                  name="state"
                  value={filters.state}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All States</option>
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
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  placeholder="Enter city"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill
                </label>
                <input
                  type="text"
                  name="skill"
                  value={filters.skill}
                  onChange={handleFilterChange}
                  placeholder="e.g., Plumber"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Rating
                </label>
                <select
                  name="rating"
                  value={filters.rating}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : artisans.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No artisans found</h3>
            <p className="text-gray-600">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artisans.map((artisan) => (
              <Link
                key={artisan.artisan_id}
                to={`/artisan/${artisan.artisan_id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-2xl font-bold text-primary-600">
                      {artisan.first_name?.[0]}{artisan.last_name?.[0]}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {artisan.first_name} {artisan.last_name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        {artisan.city}, {artisan.state}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium text-gray-900">
                        {artisan.rating ? artisan.rating.toFixed(1) : 'N/A'}
                      </span>
                      <span className="ml-1 text-sm text-gray-600">
                        ({artisan.total_reviews} reviews)
                      </span>
                    </div>
                    {artisan.hourly_rate && (
                      <p className="text-sm text-gray-600">
                        ₦{artisan.hourly_rate}/hour
                      </p>
                    )}
                  </div>

                  {artisan.skills && artisan.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {artisan.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {artisan.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{artisan.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-4">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        artisan.availability_status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {artisan.availability_status === 'available' ? 'Available' : 'Busy'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ArtisanSearch;
