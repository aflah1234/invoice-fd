import axios from 'axios';

const normalizeApiURL = (value) => {
  if (!value) return '';
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/+$/, '').endsWith('/api')
    ? withProtocol.replace(/\/+$/, '')
    : `${withProtocol.replace(/\/+$/, '')}/api`;
};

const fallbackBaseURL = (() => {
  if (process.env.REACT_APP_API_URL) return normalizeApiURL(process.env.REACT_APP_API_URL);
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return `${window.location.origin}/api`;
  }
  return '/api';
})();

const API = axios.create({
  baseURL: fallbackBaseURL,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — log out
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;
