import { createContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../services/authService';

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
  const [user, setUser] = useState(readStoredUser);

  const login = async (credentials) => {
    const authData = await loginRequest(credentials);

    sessionStorage.setItem(STORAGE_KEYS.token, authData.token);
    sessionStorage.setItem(STORAGE_KEYS.user, JSON.stringify(authData.user));
    sessionStorage.setItem(STORAGE_KEYS.expiresAt, authData.expiresAt);

    setUser(authData.user);
    navigate('/dashboard', { replace: true });
  };

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEYS.token);
    sessionStorage.removeItem(STORAGE_KEYS.user);
    sessionStorage.removeItem(STORAGE_KEYS.expiresAt);
    setUser(null);
    navigate('/login', { replace: true });
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'Admin',
      login,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
