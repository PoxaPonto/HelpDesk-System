import api from './api';

export async function getTickets(params = {}) {
  const { data } = await api.get('/tickets', { params });
  return data.data;
}

export async function getTicketById(id) {
  const { data } = await api.get(`/tickets/${id}`);
  return data.data;
}

export async function createTicket(payload) {
  const { data } = await api.post('/tickets', payload);
  return data.data;
}

export async function updateTicket(id, payload) {
  const { data } = await api.put(`/tickets/${id}`, payload);
  return data.data;
}

export async function updateTicketStatus(id, status) {
  const { data } = await api.put(`/tickets/${id}/status`, { status });
  return data.data;
}

export async function assignTicket(id, technicianId = null) {
  const { data } = await api.put(`/tickets/${id}/assign`, { technicianId });
  return data.data;
}

export async function deleteTicket(id) {
  const { data } = await api.delete(`/tickets/${id}`);
  return data.data;
}
