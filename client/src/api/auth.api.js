import axios from 'axios';
import { API_BASE_URL } from './axios.config';

/**
 * Authentication API Calls
 * All requests are made through axios with error handling
 */

/**
 * Register a new user
 */
export const register = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
    return response.data.data; // { user, token }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

/**
 * Login user with email and password
 */
export const login = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, data);
    return response.data.data; // { user, token }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

/**
 * Get current authenticated user
 * Requires valid JWT token
 */
export const getMe = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data.user;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user');
  }
};
