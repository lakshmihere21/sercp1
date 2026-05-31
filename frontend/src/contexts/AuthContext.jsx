import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import { initSocket, disconnectSocket } from '../services/socket';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const setupSocket = useCallback((token) => {
    if (token) initSocket(token);
  }, []);

  // Load user from stored token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) { setLoading(false); setInitialized(true); return; }
      try {
        const { data } = await authAPI.getMe();
        setUser(data.user);
        setupSocket(token);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };
    initAuth();
  }, [setupSocket]);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    setupSocket(data.accessToken);
    return data;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    setupSocket(data.accessToken);
    return data;
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    disconnectSocket();
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const isAdmin = user?.role === 'admin';
  const isResponder = user?.role === 'responder';
  const isVolunteer = user?.role === 'volunteer';
  const isCitizen = user?.role === 'citizen';

  return (
    <AuthContext.Provider value={{ user, loading, initialized, login, register, logout, updateUser, isAdmin, isResponder, isVolunteer, isCitizen }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
