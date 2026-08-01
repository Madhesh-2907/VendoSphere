import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, register as registerApi, getMe as getMeApi } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('cp_token');
      if (token) {
        try {
          const res = await getMeApi();
          setUser(res.user);
        } catch (err) {
          console.error('Session restore failed:', err);
          localStorage.removeItem('cp_token');
          localStorage.removeItem('cp_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginUser = async (email, password) => {
    const data = await loginApi({ email, password });
    localStorage.setItem('cp_token', data.token);
    localStorage.setItem('cp_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const registerUser = async (userData) => {
    const data = await registerApi(userData);
    localStorage.setItem('cp_token', data.token);
    localStorage.setItem('cp_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logoutUser = () => {
    localStorage.removeItem('cp_token');
    localStorage.removeItem('cp_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginUser,
        registerUser,
        logoutUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
