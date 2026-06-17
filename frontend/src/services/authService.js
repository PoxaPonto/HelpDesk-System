import api from './api';

export async function login(credentials) {
  const { data } = await api.post('/auth/login', credentials);
  return data.data;
}

export async function getProfile() {
  const { data } = await api.get('/auth/me');
  return data.data;
}

export async function register(payload) {
  const { data } = await api.post('/auth/register', payload);
  return data.data;
}
