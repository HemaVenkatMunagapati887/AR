import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      localStorage.setItem('admin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('admin_user');
    }
  }, [user]);

  async function login(workerId, password) {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { workerId, password });
      if (data.user.role !== 'admin') {
        throw new Error('This account is not an admin account.');
      }
      localStorage.setItem('admin_token', data.token);
      setUser(data.user);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('admin_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
