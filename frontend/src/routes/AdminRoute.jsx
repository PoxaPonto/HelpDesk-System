import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getHomePath } from '../utils/roleHome.js';

function AdminRoute() {
  const { isAdmin, user } = useAuth();

  return isAdmin ? <Outlet /> : <Navigate to={getHomePath(user?.role)} replace />;
}

export default AdminRoute;
