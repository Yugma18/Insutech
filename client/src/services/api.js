import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT — user token takes precedence for /user/* routes, admin token for /admin/*
api.interceptors.request.use((config) => {
  const url = config.url || '';
  if (url.startsWith('/user/')) {
    const token = localStorage.getItem('user_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } else {
    const token = localStorage.getItem('admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
