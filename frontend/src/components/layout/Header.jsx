import { useAuth } from '../../hooks/useAuth';
import { roleLabels } from '../../utils/roleLabels.js';

function Header() {
  const { user, logout } = useAuth();
  const initials = user?.name
    ?.split(' ')
    .slice(0, 2)
    .map((namePart) => namePart[0])
    .join('')
    .toUpperCase();

  return (
    <header className="header">
      <div>
        <p className="header-eyebrow">Service Desk</p>
        <h1>Gerenciamento de chamados</h1>
      </div>

      <div className="header-user">
        <span className="user-avatar">{initials || 'US'}</span>
        <div>
          <strong>{user?.name}</strong>
          <span>{user?.email} - {roleLabels[user?.role] ?? user?.role}</span>
        </div>
        <button className="logout-button" type="button" onClick={logout}>
          Sair
        </button>
      </div>
    </header>
  );
}

export default Header;
