import { createContext, useContext, useEffect, useState } from 'react';
import { api, setToken, loadToken } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = loadToken();
    if (!token) {
      setReady(true);
      return;
    }
    setToken(token);
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => setToken(null))
      .finally(() => setReady(true));
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const register = async (name, email, password, locale) => {
    const res = await api.post('/auth/register', { name, email, password, locale });
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
