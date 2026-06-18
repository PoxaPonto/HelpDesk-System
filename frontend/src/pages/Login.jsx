import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast.js';
import { getHomePath } from '../utils/roleHome.js';

function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const toast = useToast();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={getHomePath(user?.role)} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(credentials);
    } catch (err) {
      setError(err.response?.data?.Message ?? err.response?.data?.message ?? 'Nao foi possivel entrar.');
      toast?.showToast('Nao foi possivel entrar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-brand">
          <span className="brand-mark">HD</span>
          <div>
            <strong>HelpDesk Pro</strong>
            <span>Service Desk</span>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <p className="header-eyebrow">Acesso seguro</p>
            <h1>Entrar no sistema</h1>
          </div>

          <Input
            id="email"
            label="E-mail"
            name="email"
            type="email"
            value={credentials.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <Input
            id="password"
            label="Senha"
            name="password"
            type="password"
            value={credentials.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />

          {error && <p className="form-error">{error}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>

          <Link className="auth-link" to="/register">
            Nao possui conta? Cadastre-se
          </Link>
        </form>
      </section>
    </main>
  );
}

export default Login;
