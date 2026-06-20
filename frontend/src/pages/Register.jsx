import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { register } from '../services/authService.js';

function Register() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/my-tickets" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('A confirmação de senha não confere.');
      return;
    }

    setLoading(true);

    try {
      await register(form);
      toast?.showToast('Cadastro realizado com sucesso. Entre com seu e-mail e senha.');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message ?? 'Não foi possível cadastrar.');
      toast?.showToast('Não foi possível cadastrar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-brand">
          <span className="brand-logo brand-logo-lg" aria-hidden="true">
            <span className="brand-logo-dot" />
          </span>
          <div>
            <strong>HelpDesk Pro</strong>
            <span>Service Desk</span>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <p className="header-eyebrow">Novo acesso</p>
            <h1>Criar conta</h1>
          </div>

          <Input id="name" label="Nome" name="name" value={form.name} onChange={handleChange} required />
          <Input id="email" label="E-mail" name="email" type="email" value={form.email} onChange={handleChange} required />
          <Input id="password" label="Senha" name="password" type="password" value={form.password} onChange={handleChange} minLength="6" required />
          <Input id="confirmPassword" label="Confirmar senha" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} minLength="6" required />

          {error && <p className="form-error">{error}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </Button>

          <Link className="auth-link" to="/login">
            Já possui conta? Entrar
          </Link>
        </form>
      </section>
    </main>
  );
}

export default Register;
