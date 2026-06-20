import { useEffect, useMemo, useState } from 'react';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Input from '../components/ui/Input.jsx';
import Loader from '../components/ui/Loader.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useToast } from '../hooks/useToast.js';
import { createUser, deleteUser, getUsers, updateUser } from '../services/userService.js';
import { formatDate } from '../utils/formatDate.js';
import { roleLabels } from '../utils/roleLabels.js';

const emptyForm = { name: '', email: '', password: '', role: 'Client', active: true };
const roleOptions = ['Admin', 'Technician', 'Client'];

function Users() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ search: '', role: '', active: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalUser, setModalUser] = useState(undefined);
  const [form, setForm] = useState(emptyForm);

  const query = useMemo(() => ({
    search: filters.search || undefined,
    role: filters.role || undefined,
    active: filters.active === '' ? undefined : filters.active === 'true',
  }), [filters]);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function loadUsers() {
    setLoading(true);
    setError('');

    try {
      setUsers(await getUsers(query));
    } catch (err) {
      setError(err.response?.data?.message ?? 'Não foi possível carregar os usuários.');
    } finally {
      setLoading(false);
    }
  }

  const openCreate = () => {
    setModalUser(null);
    setForm(emptyForm);
  };

  const openEdit = (user) => {
    setModalUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role, active: user.active });
  };

  const closeModal = () => {
    setModalUser(undefined);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      if (modalUser) {
        await updateUser(modalUser.id, {
          name: form.name,
          email: form.email,
          role: form.role,
          active: form.active,
        });
        toast?.showToast('Usuário atualizado.');
      } else {
        await createUser(form);
        toast?.showToast('Usuário criado.');
      }

      closeModal();
      await loadUsers();
    } catch (err) {
      toast?.showToast(err.response?.data?.message ?? 'Não foi possível salvar o usuário.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (user) => {
    try {
      await deleteUser(user.id);
      toast?.showToast('Usuário desativado.');
      await loadUsers();
    } catch (err) {
      toast?.showToast(err.response?.data?.message ?? 'Não foi possível desativar o usuário.', 'error');
    }
  };

  const showModal = modalUser !== undefined;

  return (
    <section className="content-section">
      <div className="page-heading">
        <div>
          <p className="header-eyebrow">Administracao</p>
          <h2>Usuarios</h2>
        </div>
        <Button onClick={openCreate}>Criar usuário</Button>
      </div>

      <div className="filters-bar users-filters">
        <input
          name="search"
          value={filters.search}
          onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
          placeholder="Buscar por nome ou e-mail"
        />
        <select name="role" value={filters.role} onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value }))}>
          <option value="">Todos os perfis</option>
          {roleOptions.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
        </select>
        <select name="active" value={filters.active} onChange={(event) => setFilters((current) => ({ ...current, active: event.target.value }))}>
          <option value="">Todos os status</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
      </div>

      {error && <p className="alert alert-error">{error}</p>}

      {loading ? (
        <div className="centered-state"><Loader label="Carregando usuarios" /></div>
      ) : users.length === 0 ? (
        <EmptyState title="Nenhum usuário encontrado" description="Ajuste os filtros ou crie um novo usuário." />
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
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td><strong>{user.name}</strong></td>
                  <td>{user.email}</td>
                  <td>{roleLabels[user.role] ?? user.role}</td>
                  <td>
                    <span className={`table-status ${user.active ? 'is-active' : 'is-inactive'}`}>
                      {user.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="row-actions">
                      <Button variant="secondary" onClick={() => openEdit(user)}>Editar</Button>
                      {user.active && <Button variant="danger" onClick={() => handleDeactivate(user)}>Desativar</Button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={modalUser ? 'Editar usuário' : 'Criar usuário'} onClose={closeModal}>
          <form className="modal-form" onSubmit={handleSubmit}>
            <Input id="user-name" label="Nome" name="name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            <Input id="user-email" label="E-mail" name="email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
            {!modalUser && (
              <Input id="user-password" label="Senha" name="password" type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} minLength="6" required />
            )}
            <label className="field" htmlFor="user-role">
              <span>Perfil</span>
              <select id="user-role" value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}>
                {roleOptions.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
              </select>
            </label>
            {modalUser && (
              <label className="field checkbox-field">
                <input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} />
                <span>Usuário ativo</span>
              </label>
            )}
            <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
          </form>
        </Modal>
      )}
    </section>
  );
}

export default Users;
