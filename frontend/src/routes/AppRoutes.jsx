import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout.jsx';
import AssignedTickets from '../pages/AssignedTickets.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Login from '../pages/Login.jsx';
import MyTickets from '../pages/MyTickets.jsx';
import NewTicket from '../pages/NewTicket.jsx';
import Profile from '../pages/Profile.jsx';
import Register from '../pages/Register.jsx';
import TicketDetails from '../pages/TicketDetails.jsx';
import Tickets from '../pages/Tickets.jsx';
import Users from '../pages/Users.jsx';
import AdminRoute from './AdminRoute.jsx';
import PrivateRoute from './PrivateRoute.jsx';
import RoleRoute from './RoleRoute.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<PrivateRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/my-tickets" replace />} />

          <Route element={<RoleRoute allowedRoles={['Admin']} />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="usuarios" element={<Users />} />
            <Route path="chamados" element={<Tickets />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={['Client']} />}>
            <Route path="my-tickets" element={<MyTickets />} />
            <Route path="chamados/novo" element={<NewTicket />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={['Technician']} />}>
            <Route path="assigned-tickets" element={<AssignedTickets />} />
          </Route>

          <Route path="chamados/:id" element={<TicketDetails />} />

          <Route element={<AdminRoute />}>
            <Route path="categorias" element={<div className="page-placeholder">Categorias em construcao</div>} />
            <Route path="relatorios" element={<div className="page-placeholder">Relatorios em construcao</div>} />
          </Route>

          <Route path="perfil" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
