import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { getCategories } from '../services/categoryService.js';
import { createTicket } from '../services/ticketService.js';
import { priorityOptions } from '../utils/priorityLabels.js';

function NewTicket() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    categoryId: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      const data = await getCategories();
      setCategories(data);
      setForm((current) => ({ ...current, categoryId: data[0]?.id ?? '' }));
    }

    loadCategories();
  }, []);

  if (user?.role === 'Technician') {
    return (
      <section className="content-section">
        <p className="alert alert-warning">Tecnicos nao podem abrir chamados.</p>
      </section>
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const ticket = await createTicket(form);
      navigate(`/chamados/${ticket.id}`);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Nao foi possivel criar o chamado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="content-section narrow-section">
      <div className="page-heading">
        <div>
          <p className="header-eyebrow">Novo chamado</p>
          <h2>Abrir solicitacao</h2>
        </div>
      </div>

      <form className="ticket-form" onSubmit={handleSubmit}>
        <Input
          id="title"
          label="Titulo"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <label className="field" htmlFor="description">
          <span>Descricao</span>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="6"
            required
          />
        </label>

        <label className="field" htmlFor="categoryId">
          <span>Categoria</span>
          <select id="categoryId" name="categoryId" value={form.categoryId} onChange={handleChange} required>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field" htmlFor="priority">
          <span>Prioridade</span>
          <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
            {priorityOptions.filter((option) => option.value).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="alert alert-error">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? 'Criando...' : 'Criar chamado'}
        </Button>
      </form>
    </section>
  );
}

export default NewTicket;
