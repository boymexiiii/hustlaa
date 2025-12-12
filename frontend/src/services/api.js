import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const artisansAPI = {
  getAll: (params) => api.get('/artisans', { params }),
  getById: (id) => api.get(`/artisans/${id}`),
  updateProfile: (data) => api.put('/artisans/profile', data),
  setLocation: (data) => api.post('/artisans/location', data),
  addService: (data) => api.post('/artisans/services', data),
  getStates: () => api.get('/artisans/meta/states'),
  searchNearby: (params) => api.get('/artisans/search/nearby', { params }),
};

export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getCustomerBookings: (params) => api.get('/bookings/customer', { params }),
  getArtisanBookings: (params) => api.get('/bookings/artisan', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, data) => api.patch(`/bookings/${id}/status`, data),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
  addReview: (id, data) => api.post(`/bookings/${id}/review`, data),
};

export const paymentsAPI = {
  initialize: (data) => api.post('/payments/initialize', data),
  verify: (reference) => api.post(`/payments/verify/${reference}`),
  getHistory: (params) => api.get('/payments/history', { params }),
  getById: (id) => api.get(`/payments/${id}`),
};

export const usersAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/password', data),
  getDashboard: () => api.get('/users/dashboard'),
};

export const uploadAPI = {
  uploadProfilePicture: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadServiceImage: (serviceId, file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post(`/upload/service-image/${serviceId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadVerificationDocument: (file) => {
    const formData = new FormData();
    formData.append('document', file);
    return api.post('/upload/verification-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getPendingVerifications: () => api.get('/admin/verifications/pending'),
  verifyArtisan: (artisanId, data) => api.post(`/admin/verifications/${artisanId}`, data),
  getBookings: (params) => api.get('/admin/bookings', { params }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
};

export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  getTransactions: (params) => api.get('/wallet/transactions', { params }),
  topup: (data) => api.post('/wallet/topup', data),
  withdraw: (data) => api.post('/wallet/withdraw', data),
  payBooking: (data) => api.post('/wallet/pay-booking', data),
};

export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (data) => api.put('/notifications/preferences', data),
  subscribeToPush: (data) => api.post('/notifications/push/subscribe', data),
  unsubscribeFromPush: (data) => api.post('/notifications/push/unsubscribe', data),
};

export const reviewsAPI = {
  getArtisanReviews: (artisanId, params) => api.get(`/reviews/artisan/${artisanId}`, { params }),
  getReviewById: (id) => api.get(`/reviews/${id}`),
  voteOnReview: (id, data) => api.post(`/reviews/${id}/vote`, data),
  addReviewResponse: (id, data) => api.post(`/reviews/${id}/response`, data),
  deleteReviewResponse: (id) => api.delete(`/reviews/${id}/response`),
  getReviewStats: (artisanId) => api.get(`/reviews/stats/${artisanId}`),
};

export const portfolioAPI = {
  getArtisanPortfolio: (artisanId, params) => api.get(`/portfolio/artisan/${artisanId}`, { params }),
  getPortfolioItem: (id) => api.get(`/portfolio/${id}`),
  createPortfolioItem: (data) => api.post('/portfolio', data),
  updatePortfolioItem: (id, data) => api.put(`/portfolio/${id}`, data),
  deletePortfolioItem: (id) => api.delete(`/portfolio/${id}`),
  getArtisanCertifications: (artisanId) => api.get(`/portfolio/certifications/${artisanId}`),
  addCertification: (data) => api.post('/portfolio/certifications', data),
  updateCertification: (id, data) => api.put(`/portfolio/certifications/${id}`, data),
  deleteCertification: (id) => api.delete(`/portfolio/certifications/${id}`),
};

export default api;
