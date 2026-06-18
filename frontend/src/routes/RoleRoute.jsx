import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { getHomePath } from '../utils/roleHome.js';

function RoleRoute({ allowedRoles = [] }) {
  const { user } = useAuth();

  return allowedRoles.includes(user?.role)
    ? <Outlet />
    : <Navigate to={getHomePath(user?.role)} replace />;
}

export default RoleRoute;
