import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL;
const defaultApiUrl = (rawApiUrl && rawApiUrl !== '/' && rawApiUrl.trim() !== '') ? rawApiUrl : '/api/v1';

const API = axios.create({
  baseURL: defaultApiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    const activeBranchId = localStorage.getItem('activeBranchId');

    if (config.headers) {
      if (config.url && config.url.includes('/saas-admin')) {
        const adminToken = localStorage.getItem('saasAdminToken');
        if (adminToken) {
          config.headers.Authorization = `Bearer ${adminToken}`;
        }
      } else {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }

    if (activeBranchId && config.headers) {
      config.headers['X-Branch-ID'] = activeBranchId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor to gracefully handle expired JWT sessions with automatic refresh token retry
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/saas-admin')
    ) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await API.post('/auth/refresh');
        if (refreshResponse.data && refreshResponse.data.accessToken) {
          const newToken = refreshResponse.data.accessToken;
          localStorage.setItem('accessToken', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return API(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('activeBranchId');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    if (error.response && error.response.status === 401) {
      if (originalRequest && originalRequest.url?.includes('/saas-admin')) {
        localStorage.removeItem('saasAdminToken');
        localStorage.removeItem('saasAdminUser');
        if (!window.location.pathname.includes('/saas-admin/login')) {
          window.location.href = '/saas-admin/login';
        }
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('activeBranchId');
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/saas-admin')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;
