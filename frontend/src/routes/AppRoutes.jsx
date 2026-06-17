import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Login from '../pages/Login.jsx';
import NewTicket from '../pages/NewTicket.jsx';
import TicketDetails from '../pages/TicketDetails.jsx';
import Tickets from '../pages/Tickets.jsx';
import Users from '../pages/Users.jsx';
import AdminRoute from './AdminRoute.jsx';
import PrivateRoute from './PrivateRoute.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<PrivateRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="chamados" element={<Tickets />} />
          <Route path="chamados/novo" element={<NewTicket />} />
          <Route path="chamados/:id" element={<TicketDetails />} />

          <Route element={<AdminRoute />}>
            <Route path="usuarios" element={<Users />} />
          </Route>

          <Route path="categorias" element={<div className="page-placeholder">Categorias em construcao</div>} />
          <Route path="relatorios" element={<div className="page-placeholder">Relatorios em construcao</div>} />
          <Route path="perfil" element={<div className="page-placeholder">Perfil em construcao</div>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;
