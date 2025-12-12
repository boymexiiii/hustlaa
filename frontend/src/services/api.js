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

export default api;
