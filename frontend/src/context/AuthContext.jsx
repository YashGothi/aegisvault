import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, authStorage } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authStorage.getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      if (authStorage.isAuthenticated()) {
        try {
          const profile = await authApi.getCurrentUser();
          setUser(profile);
        } catch (err) {
          console.warn('Session verification failed:', err);
          authStorage.clearAuth();
          setUser(null);
        }
      }
      setLoading(false);
    }

    initAuth();

    const handleExpired = () => {
      authStorage.clearAuth();
      setUser(null);
    };

    window.addEventListener('auth-expired', handleExpired);
    return () => window.removeEventListener('auth-expired', handleExpired);
  }, []);

  const login = async (username, password) => {
    const data = await authApi.login(username, password);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
