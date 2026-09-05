import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smartrescue_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('smartrescue_token'));
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data);
          localStorage.setItem('smartrescue_user', JSON.stringify(res.data));
          fetchNotifications();
        } catch (err) {
          console.error("Auth check failed:", err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const res = await userAPI.getNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('smartrescue_token', access_token);
    localStorage.setItem('smartrescue_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setNotifications([]);
    localStorage.removeItem('smartrescue_token');
    localStorage.removeItem('smartrescue_user');
  };

  const getDashboardRoute = (role) => {
    switch (role?.toUpperCase()) {
      case 'PATIENT':
        return '/patient/dashboard';
      case 'DRIVER':
        return '/driver/dashboard';
      case 'HOSPITAL':
        return '/hospital/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      notifications,
      login,
      register,
      logout,
      fetchNotifications,
      getDashboardRoute
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
