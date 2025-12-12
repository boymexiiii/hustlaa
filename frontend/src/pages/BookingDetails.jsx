import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, DollarSign, Star, Phone } from 'lucide-react';
import { bookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const response = await bookingsAPI.getById(id);
      setBooking(response.data);
    } catch (error) {
      toast.error('Failed to fetch booking details');
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await bookingsAPI.updateStatus(id, { status: newStatus });
      toast.success('Booking status updated');
      fetchBooking();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await bookingsAPI.cancel(id);
      toast.success('Booking cancelled');
      fetchBooking();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await bookingsAPI.addReview(id, reviewData);
      toast.success('Review submitted successfully');
      setShowReviewModal(false);
      fetchBooking();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking not found</h2>
          <button
            onClick={() => navigate('/bookings')}
            className="text-primary-600 hover:text-primary-700"
          >
            Back to bookings
          </button>
        </div>
      </div>
    );
  }

  const isCustomer = user?.user_type === 'customer';
  const canCancel = isCustomer && ['pending', 'confirmed'].includes(booking.status);
  const canReview = isCustomer && booking.status === 'completed';

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/bookings')}
          className="text-primary-600 hover:text-primary-700 mb-6 flex items-center"
        >
          ← Back to bookings
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
              <span className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(booking.status)}`}>
                {booking.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Service</p>
                  <p className="text-lg font-medium text-gray-900">{booking.service_name}</p>
                </div>
                {booking.service_description && (
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="text-gray-900">{booking.service_description}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="text-2xl font-bold text-primary-600">₦{booking.total_amount}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 mr-3 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium">
                      {new Date(booking.booking_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <Clock className="w-5 h-5 mr-3 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium">
                      {new Date(`2000-01-01T${booking.booking_time}`).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {booking.location_address && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
                <div className="flex items-start text-gray-700">
                  <MapPin className="w-5 h-5 mr-3 text-primary-600 mt-1" />
                  <p>{booking.location_address}</p>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {isCustomer ? 'Artisan Information' : 'Customer Information'}
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-lg font-medium text-gray-900">
                    {isCustomer
                      ? `${booking.artisan_first_name} ${booking.artisan_last_name}`
                      : `${booking.customer_first_name} ${booking.customer_last_name}`}
                  </p>
                </div>
                <div className="flex items-center text-gray-700">
                  <Phone className="w-5 h-5 mr-3 text-primary-600" />
                  <p>{isCustomer ? booking.artisan_phone : booking.customer_phone}</p>
                </div>
                {isCustomer && booking.artisan_rating && (
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current mr-2" />
                    <span className="font-medium">{booking.artisan_rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>

            {booking.notes && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
                <p className="text-gray-700">{booking.notes}</p>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate(`/chat/${id}`)}
                  className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-black"
                >
                  Open Chat
                </button>
                {!isCustomer && booking.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateStatus('confirmed')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Confirm Booking
                  </button>
                )}
                {!isCustomer && booking.status === 'confirmed' && (
                  <button
                    onClick={() => handleUpdateStatus('in_progress')}
                    className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Start Service
                  </button>
                )}
                {!isCustomer && booking.status === 'in_progress' && (
                  <button
                    onClick={() => handleUpdateStatus('completed')}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Complete Service
                  </button>
                )}
                {canCancel && (
                  <button
                    onClick={handleCancelBooking}
                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Cancel Booking
                  </button>
                )}
                {canReview && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Leave Review
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Leave a Review</h2>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= reviewData.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment (Optional)
                </label>
                <textarea
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  placeholder="Share your experience..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700"
                >
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
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

export default BookingDetails;
