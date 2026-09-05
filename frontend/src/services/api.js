import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartrescue_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if unauthorized and not already on login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('smartrescue_token');
        localStorage.removeItem('smartrescue_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const emergencyAPI = {
  create: (data) => api.post('/emergencies', data),
  previewTriage: (data) => api.post('/emergencies/triage-preview', data),
  list: () => api.get('/emergencies'),
  getById: (id) => api.get(`/emergencies/${id}`),
  updateStatus: (id, status) => api.patch(`/emergencies/${id}/status`, { status }),
  cancel: (id) => api.post(`/emergencies/${id}/cancel`),
};

export const ambulanceAPI = {
  getAll: () => api.get('/ambulances'),
  getAvailable: () => api.get('/ambulances/available'),
  getMyAmbulance: () => api.get('/ambulances/my-ambulance'),
  getById: (id) => api.get(`/ambulances/${id}`),
  updateStatus: (id, status) => api.patch(`/ambulances/${id}/status`, { status }),
  acceptEmergency: (ambulanceId, emergencyId) => api.post(`/ambulances/${ambulanceId}/accept?emergency_id=${emergencyId}`),
  updateLocation: (id, location) => api.post(`/ambulances/${id}/location`, location),
};

export const hospitalAPI = {
  getAll: () => api.get('/hospitals'),
  getNearby: (lat, lon) => api.get(`/hospitals/nearby?lat=${lat}&lon=${lon}`),
  getById: (id) => api.get(`/hospitals/${id}`),
  updateAvailability: (id, emergency_available) => api.patch(`/hospitals/${id}/availability`, { emergency_available }),
};

export const adminAPI = {
  getStatistics: () => api.get('/admin/statistics'),
  getUsers: () => api.get('/admin/users'),
  getEmergencies: () => api.get('/admin/emergencies'),
  getAmbulances: () => api.get('/admin/ambulances'),
};

export const userAPI = {
  getNotifications: () => api.get('/users/notifications'),
  markNotificationRead: (id) => api.patch(`/users/notifications/${id}/read`),
};
