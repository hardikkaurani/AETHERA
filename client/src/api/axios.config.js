import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Axios Instance Configuration
 * Automatically adds auth token to requests
 * Handles 401 responses (unauthorized)
 */
export const createApiInstance = (token) => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 second timeout
  });

  // Request interceptor - add auth token
  instance.interceptors.request.use(
    (config) => {
      const authToken = token || localStorage.getItem('authToken');
      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle errors
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle specific error cases
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('authToken');
        window.location.href = '/login?session=expired';
        return Promise.reject(new Error('Session expired. Please login again.'));
      }

      if (error.response?.status === 429) {
        return Promise.reject(new Error('Too many requests. Please try again later.'));
      }

      if (error.response?.status === 403) {
        return Promise.reject(new Error('Access denied. You do not have permission.'));
      }

      if (error.code === 'ECONNABORTED') {
        return Promise.reject(new Error('Request timeout. Please check your connection.'));
      }

      if (!window.navigator.onLine) {
        return Promise.reject(new Error('No internet connection. Please check your network.'));
      }

      // Default error message
      return Promise.reject(
        new Error(error.response?.data?.message || error.message || 'An error occurred')
      );
    }
  );

  return instance;
};

export default createApiInstance;
