import axios from 'axios';

// API base URL
// Use VITE_API_BASE_URL if provided (for React-only deployments with external API host)
const API_BASE_URL = (import.meta?.env && import.meta.env.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL
  : (process.env.NODE_ENV === 'production' 
    ? '/api' // same-origin in production
    : 'http://localhost:3001/api');

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminLoggedIn');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      if (response.data.success && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('adminLoggedIn', 'true');
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  verify: async () => {
    try {
      const response = await api.post('/auth/verify');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Token verification failed');
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminLoggedIn');
  },

  updatePassword: async (newPassword) => {
    try {
      const response = await api.put('/auth/password', { newPassword });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update password');
    }
  }
};

// Menu Items API
export const menuAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/menu');
      // Alias support: if wrapped {data}, unwrap
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch menu items');
    }
  },

  create: async (itemData) => {
    try {
      const response = await api.post('/menu', itemData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw new Error(error.response?.data?.error || 'Failed to create menu item');
    }
  },

  update: async (id, itemData) => {
    try {
      const response = await api.put(`/menu/${id}`, itemData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw new Error(error.response?.data?.error || 'Failed to update menu item');
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/menu/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete menu item');
    }
  }
};

// Cafe Settings API
export const settingsAPI = {
  // Return array to match entities expectations
  getAll: async () => {
    try {
      const response = await api.get('/cafe-settings');
      const data = response.data?.data || null;
      return data ? [data] : [];
    } catch (error) {
      console.error('Error fetching cafe settings:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch cafe settings');
    }
  },

  create: async (settingsData) => {
    try {
      const response = await api.put('/cafe-settings', settingsData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating cafe settings:', error);
      throw new Error(error.response?.data?.error || 'Failed to create cafe settings');
    }
  },

  update: async (_id, settingsData) => {
    try {
      const response = await api.put('/cafe-settings', settingsData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating cafe settings:', error);
      throw new Error(error.response?.data?.error || 'Failed to update cafe settings');
    }
  },

  delete: async (_id) => {
    // Not implemented on server; provide no-op to satisfy interface
    return { success: true };
  }
};

// Image Upload API
export const imageAPI = {
  upload: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error(error.response?.data?.error || 'Failed to upload image');
    }
  },

  getList: async () => {
    try {
      const response = await api.get('/images');
      return response.data.images || [];
    } catch (error) {
      console.error('Error fetching images:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch images');
    }
  },

  delete: async (filename) => {
    try {
      const response = await api.delete(`/images/${filename}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete image');
    }
  }
};

export default api;
