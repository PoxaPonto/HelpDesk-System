import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function AdminRoute() {
  const { isAdmin } = useAuth();

  return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

export default AdminRoute;
