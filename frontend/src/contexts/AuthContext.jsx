import { createContext, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../services/authService';
import { useToast } from '../hooks/useToast.js';
import { getHomePath } from '../utils/roleHome.js';

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  token: 'helpdesk.token',
  user: 'helpdesk.user',
  expiresAt: 'helpdesk.expiresAt',
};

function readStoredUser() {
  const rawUser = sessionStorage.getItem(STORAGE_KEYS.user);
  const expiresAt = sessionStorage.getItem(STORAGE_KEYS.expiresAt);

  if (!rawUser || !expiresAt || new Date(expiresAt) <= new Date()) {
    sessionStorage.removeItem(STORAGE_KEYS.token);
    sessionStorage.removeItem(STORAGE_KEYS.user);
    sessionStorage.removeItem(STORAGE_KEYS.expiresAt);
    return null;
  }

  return JSON.parse(rawUser);
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [user, setUser] = useState(readStoredUser);

  const login = useCallback(async (credentials) => {
    const authData = await loginRequest(credentials);

    sessionStorage.setItem(STORAGE_KEYS.token, authData.token);
    sessionStorage.setItem(STORAGE_KEYS.user, JSON.stringify(authData.user));
    sessionStorage.setItem(STORAGE_KEYS.expiresAt, authData.expiresAt);

    setUser(authData.user);
    toast?.showToast('Login realizado com sucesso.');
    navigate(getHomePath(authData.user.role), { replace: true });
  }, [navigate, toast]);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEYS.token);
    sessionStorage.removeItem(STORAGE_KEYS.user);
    sessionStorage.removeItem(STORAGE_KEYS.expiresAt);
    setUser(null);
    toast?.showToast('Sessao encerrada.', 'info');
    navigate('/login', { replace: true });
  }, [navigate, toast]);

  const updateStoredUser = useCallback((nextUser) => {
    sessionStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'Admin',
      isTechnician: user?.role === 'Technician',
      isClient: user?.role === 'Client',
      login,
      logout,
      updateStoredUser,
    }),
    [login, logout, updateStoredUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
