import axios from 'axios';
import { toast } from 'react-hot-toast';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si l'erreur est 401 (non autorisé) et que ce n'est pas une tentative de rafraîchissement
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;

      // Essayer de rafraîchir le token
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // Rediriger vers la page de connexion si pas de refresh token
          localStorage.removeItem('token');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken
        });

        const { accessToken } = response.data;

        // Mettre à jour le token
        localStorage.setItem('token', accessToken);

        // Refaire la requête originale avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Si le rafraîchissement échoue, rediriger vers la page de connexion
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Afficher les erreurs avec toast
    if (error.response?.data?.message && !originalRequest._noToast) {
      toast.error(error.response.data.message);
    }

    return Promise.reject(error);
  }
);

export default api;

// Service d'authentification
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
};

// Service utilisateur
export const userService = {
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/password', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getBalance: () => api.get('/users/balance'),
};

// Service des commandes
export const orderService = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrders: (page = 1, limit = 10, status) => {
    let url = `/orders?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    return api.get(url);
  },
  getOrder: (id) => api.get(`/orders/${id}`),
  getDashboardStats: () => api.get('/orders/stats/dashboard'),
};

// Service des services
export const serviceService = {
  getServices: (platform, category, page = 1, limit = 20) => {
    let url = `/services?page=${page}&limit=${limit}`;
    if (platform) url += `&platform=${platform}`;
    if (category) url += `&category=${category}`;
    return api.get(url);
  },
  getPlatforms: () => api.get('/services/platforms'),
  getService: (id) => api.get(`/services/${id}`),
};

// Service des paiements
export const paymentService = {
  createPayment: (paymentData) => api.post('/payments/create', paymentData),
  addFunds: (amount, method) => api.post('/payments/add-funds', { amount, method }),
  getPaymentHistory: (page = 1, limit = 10) => api.get(`/payments/history?page=${page}&limit=${limit}`),
  getPayment: (id) => api.get(`/payments/${id}`),
};

// Service d'administration
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAnalytics: (period = '30d') => api.get(`/admin/analytics?period=${period}`),
  getUsers: (page = 1, limit = 20) => api.get(`/users/admin/all?page=${page}&limit=${limit}`),
  updateUserStatus: (id, isActive) => api.put(`/users/${id}/status`, { isActive }),
  getAllOrders: (page = 1, limit = 20, status) => {
    let url = `/orders/admin/all?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    return api.get(url);
  },
  updateOrderStatus: (id, status, data = {}) => api.put(`/orders/${id}/status`, { status, ...data }),
  createService: (serviceData) => api.post('/services', serviceData),
  updateService: (id, serviceData) => api.put(`/services/${id}`, serviceData),
  deleteService: (id) => api.delete(`/services/${id}`),
  seedServices: () => api.post('/admin/services/seed'),
  getSystemInfo: () => api.get('/admin/system/info'),
};
