import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import * as authApi from '../api/auth.api';

/**
 * AuthContext
 * Manages global authentication state (user, token, loading)
 * Provides login, register, logout, and token management functionality
 */
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const tokenRefreshTimer = useRef(null);

  const clearSession = useCallback(() => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    if (tokenRefreshTimer.current) {
      clearTimeout(tokenRefreshTimer.current);
      tokenRefreshTimer.current = null;
    }
  }, []);

  /**
   * Logout user
   * Clear token from localStorage and context
   */
  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  /**
   * Decode JWT to get expiration time
   */
  const getTokenExpiration = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      return payload.exp * 1000; // Convert to milliseconds
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  };

  /**
   * Setup token expiry check
   */
  const setupTokenExpiryCheck = useCallback((token) => {
    // Clear existing timer
    if (tokenRefreshTimer.current) {
      clearTimeout(tokenRefreshTimer.current);
    }

    const expiryTime = getTokenExpiration(token);
    if (!expiryTime) return;

    const now = Date.now();
    const timeUntilExpiry = expiryTime - now;

    // Logout 1 minute before token expires
    const logoutTime = timeUntilExpiry - 60000;

    if (logoutTime > 0) {
      tokenRefreshTimer.current = setTimeout(() => {
        console.warn('Token expiring soon, logging out...');
        logout();
      }, logoutTime);
    }
  }, [logout]);

  /**
   * Check if user is already logged in on mount
   * Restore session from localStorage
   */
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      // Verify token is still valid by fetching user
      authApi
        .getMe(storedToken)
        .then((userData) => {
          setUser(userData);
          setupTokenExpiryCheck(storedToken);
        })
        .catch((err) => {
          // Token expired or invalid
          console.error('Token verification failed:', err);
          clearSession();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    return () => {
      if (tokenRefreshTimer.current) {
        clearTimeout(tokenRefreshTimer.current);
      }
    };
  }, [clearSession, setupTokenExpiryCheck]);

  /**
   * Register a new user
   */
  const register = useCallback(async (name, email, password, confirmPassword) => {
    const response = await authApi.register({
      name,
      email,
      password,
      confirmPassword,
    });
    if (response && response.token) {
      localStorage.setItem('authToken', response.token);
      setToken(response.token);
      setUser(response.user);
      setupTokenExpiryCheck(response.token);
    }
    return response;
  }, [setupTokenExpiryCheck]);

  /**
   * Login user with email and password
   */
  const login = useCallback(async (email, password) => {
    const response = await authApi.login({ email, password });
    if (response && response.token) {
      localStorage.setItem('authToken', response.token);
      setToken(response.token);
      setUser(response.user);
      setupTokenExpiryCheck(response.token);
    }
    return response;
  }, [setupTokenExpiryCheck]);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
