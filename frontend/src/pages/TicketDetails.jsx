import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import Loader from '../components/ui/Loader.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { createTicketMessage, getTicketMessages } from '../services/messageService.js';
import { assignTicket, getTicketById, updateTicketStatus } from '../services/ticketService.js';
import { formatDate } from '../utils/formatDate.js';
import { priorityLabels } from '../utils/priorityLabels.js';
import { roleLabels } from '../utils/roleLabels.js';
import { getHomePath } from '../utils/roleHome.js';
import { statusLabels, statusOptions } from '../utils/statusLabels.js';

function TicketDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const messageListRef = useRef(null);
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState('');

  const loadMessages = useCallback(async () => {
    const messageData = await getTicketMessages(id);
    const orderedMessages = orderMessages(messageData);

    setMessages(orderedMessages);

    const lastMessage = orderedMessages.at(-1);
    if (lastMessage) {
      setTicket((current) => current
        ? { ...current, updatedAt: lastMessage.createdAt }
        : current);
    }
  }, [id]);

  useEffect(() => {
    async function loadTicket() {
      setLoading(true);
      setError('');

      try {
        const ticketData = await getTicketById(id);

        setTicket(ticketData);
        setSelectedStatus(ticketData.status);
        await loadMessages();
      } catch (err) {
        setError(err.response?.data?.message ?? 'Não foi possível carregar o chamado.');
      } finally {
        setLoading(false);
      }
    }

    loadTicket();
  }, [id, loadMessages]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadMessages().catch(() => {
        // Mantem o polling silencioso para nao atrapalhar o uso da tela.
      });
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [loadMessages]);

  useEffect(() => {
    if (!messageListRef.current) {
      return;
    }

    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }, [messages]);

  const canAssign = user?.role === 'Technician' && ticket && !ticket.technicianId;
  const canUpdateStatus =
    user?.role === 'Admin' || (user?.role === 'Technician' && ticket?.technicianId === user.id);

  const handleAssign = async () => {
    try {
      const updated = await assignTicket(ticket.id);
      setTicket(updated);
      setSelectedStatus(updated.status);
      toast?.showToast('Chamado assumido com sucesso.');
    } catch (err) {
      toast?.showToast(err.response?.data?.message ?? 'Não foi possível assumir o chamado.', 'error');
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const updated = await updateTicketStatus(ticket.id, selectedStatus);
      setTicket(updated);
      toast?.showToast('Status atualizado com sucesso.');
    } catch (err) {
      toast?.showToast(err.response?.data?.message ?? 'Não foi possível atualizar o status.', 'error');
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!messageText.trim() || sendingMessage) {
      return;
    }

    setSendingMessage(true);

    try {
      await createTicketMessage(ticket.id, messageText);
      await loadMessages();
      setMessageText('');
      toast?.showToast('Mensagem enviada com sucesso.');
    } catch (err) {
      toast?.showToast(err.response?.data?.message ?? 'Não foi possível enviar a mensagem.', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleMessageKeyDown = (event) => {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    event.preventDefault();

    if (!messageText.trim() || sendingMessage) {
      return;
    }

    event.currentTarget.form?.requestSubmit();
  };

  if (loading) {
    return (
      <div className="centered-state">
        <Loader label="Carregando chamado" />
      </div>
    );
  }

  if (error) {
    return <p className="alert alert-error">{error}</p>;
  }

  return (
    <section className="content-section">
      <div className="page-heading">
        <div>
          <p className="header-eyebrow">Detalhes do chamado</p>
          <h2>{ticket.title}</h2>
        </div>
        <Link className="btn btn-secondary" to={getHomePath(user?.role)}>
          Voltar
        </Link>
      </div>

      <article className="details-panel">
        <div className="ticket-card-header">
          <div>
            <span className={`badge status-${ticket.status}`}>{statusLabels[ticket.status]}</span>
            <span className={`badge priority-${ticket.priority}`}>{priorityLabels[ticket.priority]}</span>
          </div>
          <span className="ticket-date">{formatDate(ticket.createdAt)}</span>
        </div>

        <p className="details-description">{ticket.description}</p>

        <div className="details-grid">
          <div>
            <span>Categoria</span>
            <strong>{ticket.categoryName}</strong>
          </div>
          <div>
            <span>Cliente</span>
            <strong>{ticket.clientName}</strong>
          </div>
          <div>
            <span>Técnico</span>
            <strong>{ticket.technicianName ?? 'Não atribuído'}</strong>
          </div>
          <div>
            <span>Última atualização</span>
            <strong>{formatDate(ticket.updatedAt)}</strong>
          </div>
        </div>

        <div className="details-actions">
          {canAssign && (
            <Button onClick={handleAssign}>
              Assumir chamado
            </Button>
          )}

          {canUpdateStatus && (
            <div className="status-update">
              <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
                {statusOptions.filter((option) => option.value).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button onClick={handleStatusUpdate}>Atualizar status</Button>
            </div>
          )}
        </div>
      </article>

      <section className="history-panel">
        <div>
          <p className="header-eyebrow">Histórico</p>
          <h3>Linha do tempo</h3>
        </div>

        <div className="timeline">
          <div>
            <span>Criação</span>
            <strong>{formatDate(ticket.createdAt)}</strong>
          </div>
          <div>
            <span>Status atual</span>
            <strong>{statusLabels[ticket.status]}</strong>
          </div>
          <div>
            <span>Atribuição</span>
            <strong>{ticket.technicianName ? `Técnico ${ticket.technicianName}` : 'Sem técnico atribuído'}</strong>
          </div>
          <div>
            <span>Última atividade</span>
            <strong>{formatDate(ticket.updatedAt ?? ticket.createdAt)}</strong>
          </div>
        </div>
      </section>

      <section className="conversation-panel">
        <div className="conversation-heading">
          <div>
            <p className="header-eyebrow">Conversa</p>
            <h3>Mensagens do chamado</h3>
          </div>
          <span>{messages.length} mensagens</span>
        </div>

        <div className="message-list" ref={messageListRef}>
          {messages.length === 0 ? (
            <p className="empty-conversation">Nenhuma mensagem enviada ainda.</p>
          ) : (
            messages.map((message) => {
              const isMine = message.userId === user?.id;

              return (
                <article
                  className={`message-bubble role-${message.userRole} ${isMine ? 'message-mine' : ''}`}
                  key={message.id}
                >
                  <span className="message-avatar">{getInitials(message.userName)}</span>
                  <div className="message-meta">
                    <strong>{roleLabels[message.userRole] ?? message.userRole}: {message.message}</strong>
                  </div>
                  <div className="message-meta">
                    <strong>{message.userName}</strong>
                    <span>{roleLabels[message.userRole] ?? message.userRole}</span>
                    <time>{formatDate(message.createdAt)}</time>
                  </div>
                </article>
              );
            })
          )}
        </div>

        <form className="message-form" onSubmit={handleSendMessage}>
          <label className="field" htmlFor="message">
            <span>Nova mensagem</span>
            <textarea
              id="message"
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              onKeyDown={handleMessageKeyDown}
              disabled={sendingMessage}
              rows="4"
              placeholder="Escreva uma resposta para este chamado"
            />
          </label>

          <Button type="submit" disabled={sendingMessage || !messageText.trim()}>
            {sendingMessage ? 'Enviando...' : 'Enviar mensagem'}
          </Button>
        </form>
      </section>
    </section>
  );
}

function getInitials(name) {
  return name
    ?.split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'US';
}

function orderMessages(items) {
  const uniqueMessages = new Map(items.map((message) => [message.id, message]));

  return [...uniqueMessages.values()].sort(
    (first, second) => new Date(first.createdAt) - new Date(second.createdAt),
  );
}

export default TicketDetails;
