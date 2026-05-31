import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor ────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ───────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  refresh: (token) => api.post('/auth/refresh', { refreshToken: token }),
};

// ─── Alerts ─────────────────────────────────────────────────────────────────
export const alertAPI = {
  triggerSOS: (data) => api.post('/alerts/sos', data),
  getAll: (params) => api.get('/alerts', { params }),
  getMy: () => api.get('/alerts/my'),
  getNearby: (params) => api.get('/alerts/nearby', { params }),
  getOne: (id) => api.get(`/alerts/${id}`),
  updateStatus: (id, data) => api.patch(`/alerts/${id}/status`, data),
  assign: (id, data) => api.post(`/alerts/${id}/assign`, data),
  uploadImages: (id, formData) => api.post(`/alerts/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.patch('/users/profile', data),
  updateLocation: (data) => api.patch('/users/location', data),
};

// ─── Emergency Contacts ──────────────────────────────────────────────────────
export const contactAPI = {
  getAll: () => api.get('/contacts'),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
};

// ─── Responders ──────────────────────────────────────────────────────────────
export const responderAPI = {
  getAll: () => api.get('/responders'),
  getAvailable: () => api.get('/responders/available'),
  register: (data) => api.post('/responders/register', data),
  updateStatus: (data) => api.patch('/responders/status', data),
};

// ─── Vehicles ────────────────────────────────────────────────────────────────
export const vehicleAPI = {
  getAll: () => api.get('/vehicles'),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.patch(`/vehicles/${id}`, data),
};

// ─── Chat ────────────────────────────────────────────────────────────────────
export const chatAPI = {
  getMessages: (alertId) => api.get(`/chat/${alertId}`),
};

// ─── Notifications ───────────────────────────────────────────────────────────
export const notifAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

// ─── Analytics ───────────────────────────────────────────────────────────────
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getMonthly: () => api.get('/analytics/monthly'),
  getHeatmap: () => api.get('/analytics/heatmap'),
};

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  toggleUser: (id) => api.patch(`/admin/users/${id}/toggle`),
  getSummary: () => api.get('/admin/summary'),
};

// ─── Helplines ───────────────────────────────────────────────────────────────
export const helplineAPI = {
  getAll: (params) => api.get('/helplines', { params }),
};

export default api;
