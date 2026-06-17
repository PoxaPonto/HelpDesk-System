import { Navigate, Outlet } from 'react-router-dom';

function RoleRoute({ allowedRoles = [], currentRole }) {
  return allowedRoles.includes(currentRole) ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

export default RoleRoute;
