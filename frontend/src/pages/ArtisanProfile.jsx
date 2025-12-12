import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Phone, Calendar, DollarSign } from 'lucide-react';
import { artisansAPI, bookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ArtisanProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingData, setBookingData] = useState({
    booking_date: '',
    booking_time: '',
    location_address: '',
    notes: '',
  });

  useEffect(() => {
    fetchArtisan();
  }, [id]);

  const fetchArtisan = async () => {
    try {
      const response = await artisansAPI.getById(id);
      setArtisan(response.data);
    } catch (error) {
      toast.error('Failed to fetch artisan details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = (service) => {
    if (!user) {
      toast.error('Please login to book a service');
      navigate('/login');
      return;
    }
    if (user.user_type !== 'customer') {
      toast.error('Only customers can book services');
      return;
    }
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      await bookingsAPI.create({
        artisan_id: artisan.artisan_id,
        service_id: selectedService.id,
        ...bookingData,
      });
      toast.success('Booking created successfully!');
      setShowBookingModal(false);
      navigate('/bookings');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create booking');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!artisan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Artisan not found</h2>
          <button
            onClick={() => navigate('/search')}
            className="text-primary-600 hover:text-primary-700"
          >
            Back to search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center mb-6">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-4xl font-bold text-primary-600 mb-4 md:mb-0">
                {artisan.first_name?.[0]}{artisan.last_name?.[0]}
              </div>
              <div className="md:ml-6 flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {artisan.first_name} {artisan.last_name}
                  </h1>
                  {artisan.verification_status === 'verified' && (
                    <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-semibold">Verified</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-1" />
                    {artisan.city}, {artisan.state}
                  </div>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                    <span className="font-medium">{artisan.rating ? artisan.rating.toFixed(1) : 'N/A'}</span>
                    <span className="ml-1">({artisan.total_reviews} reviews)</span>
                  </div>
                  {artisan.hourly_rate && (
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 mr-1" />
                      ₦{artisan.hourly_rate}/hour
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <span
                    className={`inline-block px-3 py-1 text-sm rounded-full font-semibold ${
                      artisan.availability_status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {artisan.availability_status === 'available' ? 'Available' : 'Busy'}
                  </span>
                </div>
              </div>
            </div>

            {artisan.bio && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">About</h2>
                <p className="text-gray-600">{artisan.bio}</p>
              </div>
            )}

            {artisan.skills && artisan.skills.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {artisan.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {artisan.services && artisan.services.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {artisan.services.map((service) => (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold text-primary-600">₦{service.price}</p>
                        {service.duration_minutes && (
                          <p className="text-sm text-gray-500">{service.duration_minutes} mins</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleBookService(service)}
                        disabled={artisan.availability_status !== 'available'}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {artisan.reviews && artisan.reviews.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>
              <div className="space-y-4">
                {artisan.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                        {review.first_name?.[0]}{review.last_name?.[0]}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">
                          {review.first_name} {review.last_name}
                        </p>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 ml-13">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Book Service</h2>
            <form onSubmit={handleBookingSubmit}>
              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  <strong>{selectedService?.name}</strong> - ₦{selectedService?.price}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={bookingData.booking_date}
                  onChange={(e) => setBookingData({ ...bookingData, booking_date: e.target.value })}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={bookingData.booking_time}
                  onChange={(e) => setBookingData({ ...bookingData, booking_time: e.target.value })}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Address
                </label>
                <textarea
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={bookingData.location_address}
                  onChange={(e) => setBookingData({ ...bookingData, location_address: e.target.value })}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700"
                >
                  Confirm Booking
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
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

export default ArtisanProfile;
