import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navigationItems = [
  { label: 'Dashboard', path: '/dashboard', roles: ['Admin'], marker: 'D' },
  { label: 'Meus Chamados', path: '/my-tickets', roles: ['Client'], marker: 'M' },
  { label: 'Abrir Chamado', path: '/chamados/novo', roles: ['Client'], marker: 'A' },
  { label: 'Atendimento', path: '/assigned-tickets', roles: ['Technician'], marker: 'T' },
  { label: 'Chamados', path: '/chamados', roles: ['Admin'], marker: 'C' },
  { label: 'Usuários', path: '/usuarios', roles: ['Admin'], marker: 'U' },
  { label: 'Categorias', path: '/categorias', roles: ['Admin'], marker: 'G' },
  { label: 'Relatórios', path: '/relatorios', roles: ['Admin'], marker: 'R' },
  { label: 'Perfil', path: '/perfil', marker: 'P' },
];

function Sidebar() {
  const { user } = useAuth();

  const visibleItems = navigationItems.filter((item) => {
    return !item.roles || item.roles.includes(user?.role);
  });

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-logo" aria-hidden="true">
          <span className="brand-logo-dot" />
        </span>
        <div>
          <strong>HelpDesk Pro</strong>
          <small>Service Desk</small>
        </div>
      </div>

      <div className="sidebar-profile">
        <span>{user?.role ?? 'User'}</span>
        <strong>{user?.name ?? 'Usuário'}</strong>
      </div>

      <nav className="sidebar-nav" aria-label="Navegacao principal">
        {visibleItems.map((item) => (
          <NavLink key={item.path} to={item.path} className="sidebar-link">
            <span className="sidebar-link-marker">{item.marker}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
