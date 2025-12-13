import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Star, Filter, ChevronDown, Navigation, Map } from 'lucide-react';
import { artisansAPI, searchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getUserLocation, formatDistance, calculateDistance } from '../utils/geolocation';
import ArtisanMap from '../components/ArtisanMap';
import LocationSearch from '../components/LocationSearch';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';

const Artisans = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [filters, setFilters] = useState({
    state: searchParams.get('state') || '',
    city: searchParams.get('city') || '',
    skill: searchParams.get('skill') || '',
    rating: searchParams.get('rating') || '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyMode, setNearbyMode] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    fetchStates();
    fetchArtisans();
  }, []);

  useEffect(() => {
    fetchArtisans();
  }, [filters, nearbyMode, userLocation]);

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
      let response;
      if (nearbyMode && userLocation) {
        response = await artisansAPI.searchNearby({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius_km: 20,
          skill: filters.skill || undefined,
        });
      } else {
        response = await searchAPI.searchArtisans({
          state: filters.state || undefined,
          city: filters.city || undefined,
          skill: filters.skill || undefined,
          min_rating: filters.rating || undefined,
          sort: 'rating',
        });
      }
      
      let artisansData = (nearbyMode && userLocation)
        ? response.data
        : response.data.artisans;
      
      // Calculate distance for each artisan if user location is available
      if (userLocation) {
        artisansData = artisansData.map(artisan => {
          if (artisan.latitude && artisan.longitude) {
            const distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              parseFloat(artisan.latitude),
              parseFloat(artisan.longitude)
            );
            return { ...artisan, distance_km: distance };
          }
          return artisan;
        });
      }
      
      setArtisans(artisansData);
    } catch (error) {
      toast.error('Failed to fetch artisans');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleReset = () => {
    setFilters({ state: '', city: '', skill: '', rating: '' });
    setNearbyMode(false);
  };

  const handleNearMe = async () => {
    setGettingLocation(true);
    try {
      const location = await getUserLocation();
      setUserLocation(location);
      setNearbyMode(true);
      setFilters({ state: '', city: '', skill: filters.skill, rating: '' });
      toast.success('Showing artisans near you');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setGettingLocation(false);
    }
  };

  const handleLocationSelect = (location) => {
    setUserLocation(location);
    setNearbyMode(true);
    setFilters({ state: '', city: '', skill: filters.skill, rating: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Find Skilled Artisans</h1>
          <p className="text-primary-100 text-lg mb-6">Browse verified professionals across Nigeria</p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <LocationSearch onLocationSelect={handleLocationSelect} placeholder="Search by location..." />
            </div>
            <button
              onClick={handleNearMe}
              disabled={gettingLocation}
              className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Navigation className="w-5 h-5" />
              {gettingLocation ? 'Getting location...' : 'Near Me'}
            </button>
            <button
              onClick={() => setShowMap(!showMap)}
              className="bg-primary-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-900 transition-all flex items-center justify-center gap-2"
            >
              <Map className="w-5 h-5" />
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>
          
          {nearbyMode && (
            <div className="mt-4 bg-primary-800 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Showing artisans within 20km of your location</span>
              <button onClick={() => setNearbyMode(false)} className="ml-2 hover:text-primary-200">✕</button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showMap && userLocation && (
          <div className="mb-8">
            <ArtisanMap
              artisans={artisans}
              center={userLocation}
              zoom={12}
              onMarkerClick={(artisan) => window.open(`/artisan/${artisan.artisan_id}`, '_blank')}
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <ChevronDown className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State
                  </label>
                  <select
                    name="state"
                    value={filters.state}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={filters.city}
                    onChange={handleFilterChange}
                    placeholder="Enter city"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Skill
                  </label>
                  <input
                    type="text"
                    name="skill"
                    value={filters.skill}
                    onChange={handleFilterChange}
                    placeholder="e.g., Plumber"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Min Rating
                  </label>
                  <select
                    name="rating"
                    value={filters.rating}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                  </select>
                </div>

                <button
                  onClick={handleReset}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-all"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : artisans.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No artisans found</h3>
                <p className="text-gray-600">Try adjusting your search filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {artisans.map((artisan) => (
                  <Link
                    key={artisan.artisan_id}
                    to={`/artisan/${artisan.artisan_id}`}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden group"
                  >
                    <div className="p-6 flex gap-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
                        {artisan.first_name?.[0]}{artisan.last_name?.[0]}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {artisan.first_name} {artisan.last_name}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          {artisan.city}, {artisan.state}
                          {artisan.distance_km && (
                            <span className="ml-2 text-primary-600 font-semibold text-sm">
                              • {formatDistance(artisan.distance_km)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center">
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <span className="ml-1 font-semibold text-gray-900">
                              {artisan.rating ? artisan.rating.toFixed(1) : 'N/A'}
                            </span>
                            <span className="ml-1 text-gray-600">
                              ({artisan.total_reviews} reviews)
                            </span>
                          </div>
                          {artisan.hourly_rate && (
                            <span className="text-primary-600 font-semibold">
                              ₦{artisan.hourly_rate}/hr
                            </span>
                          )}
                        </div>

                        {artisan.skills && artisan.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {artisan.skills.slice(0, 4).map((skill, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                            {artisan.skills.length > 4 && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full font-medium">
                                +{artisan.skills.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <span
                          className={`px-3 py-1 text-sm rounded-full font-semibold ${
                            artisan.availability_status === 'available'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {artisan.availability_status === 'available' ? 'Available' : 'Busy'}
                        </span>
                        <button className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 font-semibold transition-all">
                          View Profile
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Artisans;
