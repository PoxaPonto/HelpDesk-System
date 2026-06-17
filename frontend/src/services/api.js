import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5026/api/v1',
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('helpdesk.token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('helpdesk.token');
      sessionStorage.removeItem('helpdesk.user');
      sessionStorage.removeItem('helpdesk.expiresAt');
    }

    return Promise.reject(error);
  },
);

export default api;
