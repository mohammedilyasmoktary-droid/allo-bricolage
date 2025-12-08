import axios from 'axios';
import { connectionManager } from '../utils/connectionManager';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Log the API URL (always, for debugging)
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🔗 VITE_API_URL env:', import.meta.env.VITE_API_URL || 'NOT SET');

// Warn if using default localhost in production
if (import.meta.env.PROD && API_BASE_URL.includes('localhost')) {
  console.warn('⚠️ WARNING: Using localhost API URL in production! Set VITE_API_URL environment variable.');
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15000, // 15 second timeout (increased for better reliability)
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and connection errors
apiClient.interceptors.response.use(
  (response) => {
    // Mark connection as healthy on successful response
    connectionManager.checkConnection().catch(() => {
      // Silently handle check errors
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Don't retry if request was cancelled or no config
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle connection errors with automatic retry
    const isConnectionError =
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT' ||
      error.message?.includes('Network Error') ||
      error.message?.includes('ERR_NETWORK') ||
      error.message?.includes('timeout') ||
      !error.response;

    if (isConnectionError && !originalRequest._connectionRetry) {
      originalRequest._connectionRetry = true;
      
      // Try to check connection and retry once
      const isConnected = await connectionManager.checkConnection();
      if (isConnected) {
        // Connection is back, retry the request
        return apiClient(originalRequest);
      }
    }

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          withCredentials: true,
          timeout: 5000,
        });

        const { accessToken } = response.data;
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Only redirect if we're not already on login page
        if (window.location.pathname !== '/login') {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

