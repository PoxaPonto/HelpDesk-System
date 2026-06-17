import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Loader from '../components/ui/Loader.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { getCategories } from '../services/categoryService.js';
import { assignTicket, deleteTicket, getTickets } from '../services/ticketService.js';
import { formatDate } from '../utils/formatDate.js';
import { priorityLabels, priorityOptions } from '../utils/priorityLabels.js';
import { statusLabels, statusOptions } from '../utils/statusLabels.js';

function Tickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', categoryId: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ticketToDelete, setTicketToDelete] = useState(null);

  const canCreate = user?.role === 'Client' || user?.role === 'Admin';

  const query = useMemo(
    () => ({
      search: filters.search || undefined,
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      categoryId: filters.categoryId || undefined,
    }),
    [filters],
  );

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError('');

      try {
        const [ticketData, categoryData] = await Promise.all([
          getTickets(query),
          getCategories(),
        ]);

        setTickets(ticketData);
        setCategories(categoryData);
      } catch (err) {
        setError(err.response?.data?.message ?? 'Nao foi possivel carregar os chamados.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [query]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleAssign = async (ticketId) => {
    await assignTicket(ticketId);
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, technicianId: user.id, technicianName: user.name, status: 'InProgress' }
          : ticket,
      ),
    );
  };

  const handleDelete = async () => {
    if (!ticketToDelete) return;

    await deleteTicket(ticketToDelete.id);
    setTickets((current) => current.filter((ticket) => ticket.id !== ticketToDelete.id));
    setTicketToDelete(null);
  };

  return (
    <section className="content-section">
      <div className="page-heading">
        <div>
          <p className="header-eyebrow">Chamados</p>
          <h2>Fila de atendimento</h2>
        </div>

        {canCreate && (
          <Link className="btn btn-primary" to="/chamados/novo">
            Novo chamado
          </Link>
        )}
      </div>

      <div className="filters-bar">
        <input
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Buscar por titulo"
        />

        <select name="status" value={filters.status} onChange={handleFilterChange}>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select name="priority" value={filters.priority} onChange={handleFilterChange}>
          {priorityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select name="categoryId" value={filters.categoryId} onChange={handleFilterChange}>
          <option value="">Todas as categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="alert alert-error">{error}</p>}

      {loading ? (
        <div className="centered-state">
          <Loader label="Carregando chamados" />
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          title="Nenhum chamado encontrado"
          description="Ajuste os filtros ou crie um novo chamado."
          action={canCreate ? <Link className="btn btn-primary" to="/chamados/novo">Criar chamado</Link> : null}
        />
      ) : (
        <div className="ticket-grid">
          {tickets.map((ticket) => (
            <article className="ticket-card" key={ticket.id}>
              <div className="ticket-card-header">
                <div>
                  <span className={`badge status-${ticket.status}`}>{statusLabels[ticket.status]}</span>
                  <span className={`badge priority-${ticket.priority}`}>{priorityLabels[ticket.priority]}</span>
                </div>
                <span className="ticket-date">{formatDate(ticket.createdAt)}</span>
              </div>

              <h3>{ticket.title}</h3>
              <p>{ticket.description}</p>

              <div className="ticket-meta">
                <span><strong>Categoria</strong>{ticket.categoryName}</span>
                <span><strong>Cliente</strong>{ticket.clientName}</span>
                <span><strong>Tecnico</strong>{ticket.technicianName ?? 'Nao atribuido'}</span>
              </div>

              <div className="ticket-actions">
                <Link className="btn btn-secondary" to={`/chamados/${ticket.id}`}>
                  Detalhes
                </Link>

                {user?.role === 'Technician' && !ticket.technicianId && (
                  <Button variant="primary" onClick={() => handleAssign(ticket.id)}>
                    Assumir
                  </Button>
                )}

                {(user?.role === 'Admin' || ticket.clientId === user?.id) && (
                  <Button variant="danger" onClick={() => setTicketToDelete(ticket)}>
                    Excluir
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {ticketToDelete && (
        <Modal
          title="Excluir chamado"
          description={`Deseja excluir "${ticketToDelete.title}"? Esta acao nao pode ser desfeita.`}
          onClose={() => setTicketToDelete(null)}
        >
          <Button variant="secondary" onClick={() => setTicketToDelete(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Excluir
          </Button>
        </Modal>
      )}
    </section>
  );
}

export default Tickets;
