import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Loader from '../components/ui/Loader.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { getCategories } from '../services/categoryService.js';
import { assignTicket, getTickets, updateTicketStatus } from '../services/ticketService.js';
import { priorityLabels } from '../utils/priorityLabels.js';
import { statusLabels } from '../utils/statusLabels.js';
import { TicketFilters } from './MyTickets.jsx';

function AssignedTickets() {
  const { user } = useAuth();
  const toast = useToast();
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', categoryId: '', sort: 'newest', page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const assigned = useMemo(() => tickets.filter((ticket) => ticket.technicianId === user?.id), [tickets, user?.id]);
  const unassigned = useMemo(() => tickets.filter((ticket) => !ticket.technicianId), [tickets]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

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
      setError(err.response?.data?.message ?? 'Não foi possível carregar chamados.');
    } finally {
      setLoading(false);
    }
  }

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value, page: 1 }));
  };

  const handleAssign = async (ticket) => {
    try {
      await assignTicket(ticket.id);
      toast?.showToast('Chamado assumido com sucesso.');
      await loadData();
    } catch (err) {
      toast?.showToast(err.response?.data?.message ?? 'Não foi possível assumir o chamado.', 'error');
    }
  };

  const handleStatus = async (ticket, status) => {
    try {
      await updateTicketStatus(ticket.id, status);
      toast?.showToast(status === 'Closed' ? 'Chamado encerrado.' : 'Status atualizado.');
      await loadData();
    } catch (err) {
      toast?.showToast(err.response?.data?.message ?? 'Não foi possível atualizar o status.', 'error');
    }
  };

  return (
    <section className="content-section">
      <div className="page-heading">
        <div>
          <p className="header-eyebrow">Atendimento</p>
          <h2>Chamados atribuiveis e atribuidos</h2>
        </div>
      </div>

      <TicketFilters filters={filters} categories={categories} onChange={handleFilterChange} />
      {error && <p className="alert alert-error">{error}</p>}

      {loading ? (
        <div className="centered-state"><Loader label="Carregando chamados" /></div>
      ) : (
        <>
          <TicketSection title="Chamados atribuidos" tickets={assigned} onStatus={handleStatus} />
          <TicketSection title="Chamados sem técnico" tickets={unassigned} onAssign={handleAssign} />
        </>
      )}
    </section>
  );
}

function TicketSection({ title, tickets, onAssign, onStatus }) {
  return (
    <section className="queue-section">
      <div className="conversation-heading">
        <div>
          <p className="header-eyebrow">Fila</p>
          <h3>{title}</h3>
        </div>
        <span>{tickets.length} chamados</span>
      </div>

      {tickets.length === 0 ? (
        <EmptyState title="Nenhum chamado nesta fila" description="Os chamados aparecerao aqui conforme os filtros e atribuicoes." />
      ) : (
        <div className="ticket-grid">
          {tickets.map((ticket) => (
            <article className="ticket-card" key={ticket.id}>
              <div className="ticket-card-header">
                <div>
                  <span className={`badge status-${ticket.status}`}>{statusLabels[ticket.status]}</span>
                  <span className={`badge priority-${ticket.priority}`}>{priorityLabels[ticket.priority]}</span>
                </div>
                <span className="ticket-date">#{ticket.id.slice(0, 8)}</span>
              </div>
              <h3>{ticket.title}</h3>
              <p>{ticket.description}</p>
              <div className="ticket-meta">
                <span><strong>Categoria</strong>{ticket.categoryName}</span>
                <span><strong>Cliente</strong>{ticket.clientName}</span>
                <span><strong>Técnico</strong>{ticket.technicianName ?? 'Não atribuído'}</span>
              </div>
              <div className="ticket-actions">
                <Link className="btn btn-secondary" to={`/chamados/${ticket.id}`}>Responder</Link>
                {onAssign && <Button onClick={() => onAssign(ticket)}>Assumir chamado</Button>}
                {onStatus && (
                  <>
                    <Button variant="secondary" onClick={() => onStatus(ticket, 'WaitingClient')}>Aguardar cliente</Button>
                    <Button variant="secondary" onClick={() => onStatus(ticket, 'Resolved')}>Resolver</Button>
                    <Button variant="danger" onClick={() => onStatus(ticket, 'Closed')}>Finalizar</Button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function cleanFilters(filters) {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value !== null));
}

export default AssignedTickets;
