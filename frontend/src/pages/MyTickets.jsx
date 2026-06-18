import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState.jsx';
import Loader from '../components/ui/Loader.jsx';
import { getCategories } from '../services/categoryService.js';
import { getTickets } from '../services/ticketService.js';
import { formatDate } from '../utils/formatDate.js';
import { priorityLabels, priorityOptions } from '../utils/priorityLabels.js';
import { statusLabels, statusOptions } from '../utils/statusLabels.js';

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', categoryId: '', sort: 'newest', page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const metrics = useMemo(() => [
    { label: 'Total de chamados', value: tickets.length },
    { label: 'Chamados abertos', value: tickets.filter((ticket) => ticket.status === 'Open').length },
    { label: 'Em andamento', value: tickets.filter((ticket) => ticket.status === 'InProgress').length },
    { label: 'Resolvidos', value: tickets.filter((ticket) => ['Resolved', 'Closed'].includes(ticket.status)).length },
  ], [tickets]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError('');

      try {
        const [ticketData, categoryData] = await Promise.all([
          getTickets(cleanFilters(filters)),
          getCategories(),
        ]);
        setTickets(ticketData);
        setCategories(categoryData);
      } catch (err) {
        setError(err.response?.data?.message ?? 'Nao foi possivel carregar seus chamados.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value, page: 1 }));
  };

  return (
    <section className="content-section">
      <div className="page-heading">
        <div>
          <p className="header-eyebrow">Meus chamados</p>
          <h2>Acompanhamento das suas solicitacoes</h2>
        </div>
        <Link className="btn btn-primary" to="/chamados/novo">
          Abrir novo chamado
        </Link>
      </div>

      <div className="metrics-grid">
        {metrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <TicketFilters filters={filters} categories={categories} onChange={handleFilterChange} />

      {error && <p className="alert alert-error">{error}</p>}

      {loading ? (
        <SkeletonTable />
      ) : tickets.length === 0 ? (
        <EmptyState
          title="Nenhum chamado encontrado"
          description="Abra um novo chamado ou ajuste os filtros para ver suas solicitacoes."
          action={<Link className="btn btn-primary" to="/chamados/novo">Abrir chamado</Link>}
        />
      ) : (
        <TicketTable tickets={tickets} />
      )}
    </section>
  );
}

export function TicketFilters({ filters, categories, onChange }) {
  return (
    <div className="filters-bar extended-filters">
      <input name="search" value={filters.search} onChange={onChange} placeholder="Buscar por titulo" />

      <select name="status" value={filters.status} onChange={onChange}>
        {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>

      <select name="priority" value={filters.priority} onChange={onChange}>
        {priorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>

      <select name="categoryId" value={filters.categoryId} onChange={onChange}>
        <option value="">Todas as categorias</option>
        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </select>

      <select name="sort" value={filters.sort} onChange={onChange}>
        <option value="newest">Mais recentes</option>
        <option value="oldest">Mais antigos</option>
      </select>
    </div>
  );
}

export function TicketTable({ tickets }) {
  return (
    <div className="table-card">
      <table className="data-table">
        <thead>
          <tr>
            <th>Numero</th>
            <th>Titulo</th>
            <th>Categoria</th>
            <th>Prioridade</th>
            <th>Status</th>
            <th>Tecnico</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td><Link to={`/chamados/${ticket.id}`}>#{ticket.id.slice(0, 8)}</Link></td>
              <td><strong>{ticket.title}</strong></td>
              <td>{ticket.categoryName}</td>
              <td><span className={`badge priority-${ticket.priority}`}>{priorityLabels[ticket.priority]}</span></td>
              <td><span className={`badge status-${ticket.status}`}>{statusLabels[ticket.status]}</span></td>
              <td>{ticket.technicianName ?? 'Nao atribuido'}</td>
              <td>{formatDate(ticket.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="table-card skeleton-card">
      <Loader label="Carregando chamados" />
    </div>
  );
}

function cleanFilters(filters) {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value !== null));
}

export default MyTickets;
