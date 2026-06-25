import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4100/api';

export const api = axios.create({ baseURL });

let authToken = null;

export function setToken(token) {
  authToken = token;
  if (token) localStorage.setItem('hajar_token', token);
  else localStorage.removeItem('hajar_token');
}

export function loadToken() {
  authToken = localStorage.getItem('hajar_token');
  return authToken;
}

api.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error || err.message || 'Request failed';
    return Promise.reject(new Error(message));
  },
);
