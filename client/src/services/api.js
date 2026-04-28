import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const normalizedBaseURL = rawBaseURL.replace(/\/$/, '');
const apiBaseURL = normalizedBaseURL.endsWith('/api') ? normalizedBaseURL : `${normalizedBaseURL}/api`;

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 20000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rydo_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('rydo_token');
      localStorage.removeItem('rydo_user');

      if (!window.location.pathname.includes('/login')) {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
