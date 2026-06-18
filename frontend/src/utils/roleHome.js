export function getHomePath(role) {
  if (role === 'Admin') return '/dashboard';
  if (role === 'Technician') return '/assigned-tickets';
  return '/my-tickets';
}
