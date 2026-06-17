import api from './api';

export async function getTicketMessages(ticketId) {
  const { data } = await api.get(`/tickets/${ticketId}/messages`);
  return data.data;
}

export async function createTicketMessage(ticketId, message) {
  const { data } = await api.post(`/tickets/${ticketId}/messages`, { message });
  return data.data;
}
