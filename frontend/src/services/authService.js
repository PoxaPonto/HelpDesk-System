import api from './api';

export async function login(credentials) {
  const { data } = await api.post('/auth/login', credentials);
  return data.data;
}

export async function getProfile() {
  const { data } = await api.get('/auth/me');
  return data.data;
}

export async function updateProfile(payload) {
  const { data } = await api.put('/auth/me', payload);
  return data.data;
}

export async function changePassword(payload) {
  const { data } = await api.put('/auth/me/password', payload);
  return data.data;
}

export async function register(payload) {
  const { data } = await api.post('/auth/register', payload);
  return data.data;
}
