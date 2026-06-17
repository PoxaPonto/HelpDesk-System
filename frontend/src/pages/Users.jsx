import { useEffect, useState } from 'react';
import EmptyState from '../components/ui/EmptyState.jsx';
import Loader from '../components/ui/Loader.jsx';
import { getUsers } from '../services/userService.js';
import { formatDate } from '../utils/formatDate.js';
import { roleLabels } from '../utils/roleLabels.js';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      setError('');

      try {
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        setError(err.response?.data?.message ?? 'Nao foi possivel carregar os usuarios.');
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  return (
    <section className="content-section">
      <div className="page-heading">
        <div>
          <p className="header-eyebrow">Administracao</p>
          <h2>Usuarios</h2>
        </div>
      </div>

      {error && <p className="alert alert-error">{error}</p>}

      {loading ? (
        <div className="centered-state">
          <Loader label="Carregando usuarios" />
        </div>
      ) : users.length === 0 ? (
        <EmptyState title="Nenhum usuario encontrado" description="Usuarios cadastrados aparecerao nesta lista." />
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Criado em</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.name}</strong>
                  </td>
                  <td>{user.email}</td>
                  <td>{roleLabels[user.role] ?? user.role}</td>
                  <td>
                    <span className={`table-status ${user.active ? 'is-active' : 'is-inactive'}`}>
                      {user.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Users;
