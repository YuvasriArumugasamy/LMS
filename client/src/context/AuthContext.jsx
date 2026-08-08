import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('elms_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('elms_access_token');
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data.data.user);
          localStorage.setItem('elms_user', JSON.stringify(res.data.data.user));
        } catch (error) {
          console.error('[Auth Check Error]', error);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user, accessToken, refreshToken } = res.data.data;
    localStorage.setItem('elms_access_token', accessToken);
    localStorage.setItem('elms_refresh_token', refreshToken);
    localStorage.setItem('elms_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('elms_access_token');
    localStorage.removeItem('elms_refresh_token');
    localStorage.removeItem('elms_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
