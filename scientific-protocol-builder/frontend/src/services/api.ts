import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3081/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    
    // Handle specific error codes
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      const { useAuthStore } = require('../stores/authStore');
      useAuthStore.getState().logout();
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      toast.error('Access denied');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organization?: string;
  }) => api.post('/auth/register', userData),
  
  getProfile: () => api.get('/auth/me'),
  
  updateProfile: (userData: {
    firstName?: string;
    lastName?: string;
    organization?: string;
  }) => api.put('/auth/profile', userData),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/password', { currentPassword, newPassword }),
  
  refreshToken: () => api.post('/auth/refresh'),
  
  logout: () => api.post('/auth/logout'),
};

// Protocols API
export const protocolsAPI = {
  getAll: (params?: {
    category?: string;
    tags?: string;
    search?: string;
    isTemplate?: boolean;
    page?: number;
    limit?: number;
    orderBy?: string;
    orderDirection?: string;
  }) => api.get('/protocols', { params }),
  
  getById: (id: string) => api.get(`/protocols/${id}`),
  
  create: (protocolData: {
    name: string;
    description?: string;
    category?: string;
    tags?: string[];
    workspaceXml: string;
    workspaceJson?: object;
    analysisData?: object;
    isPublic?: boolean;
    isTemplate?: boolean;
  }) => api.post('/protocols', protocolData),
  
  update: (id: string, protocolData: any) =>
    api.put(`/protocols/${id}`, protocolData),
  
  delete: (id: string) => api.delete(`/protocols/${id}`),
  
  clone: (id: string, name?: string) =>
    api.post(`/protocols/${id}/clone`, { name }),
  
  getVersions: (id: string) => api.get(`/protocols/${id}/versions`),
  
  getCategories: () => api.get('/protocols/meta/categories'),
  
  getTags: () => api.get('/protocols/meta/tags'),
};

// Instruments API
export const instrumentsAPI = {
  getAll: (params?: {
    type?: string;
    manufacturer?: string;
    location?: string;
    search?: string;
    page?: number;
    limit?: number;
    orderBy?: string;
    orderDirection?: string;
  }) => api.get('/instruments', { params }),
  
  getById: (id: string) => api.get(`/instruments/${id}`),
  
  create: (instrumentData: {
    name: string;
    type: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    location?: string;
    specifications?: object;
    calibrationData?: object;
  }) => api.post('/instruments', instrumentData),
  
  update: (id: string, instrumentData: any) =>
    api.put(`/instruments/${id}`, instrumentData),
  
  updateCalibration: (id: string, calibrationData: object) =>
    api.put(`/instruments/${id}/calibration`, { calibrationData }),
  
  delete: (id: string) => api.delete(`/instruments/${id}`),
  
  getTypes: () => api.get('/instruments/meta/types'),
  
  getManufacturers: () => api.get('/instruments/meta/manufacturers'),
  
  getLocations: () => api.get('/instruments/meta/locations'),
};

// Users API
export const usersAPI = {
  getAll: (params?: {
    role?: string;
    page?: number;
    limit?: number;
  }) => api.get('/users', { params }),
  
  getById: (id: string) => api.get(`/users/${id}`),
  
  delete: (id: string) => api.delete(`/users/${id}`),
};

export default api;