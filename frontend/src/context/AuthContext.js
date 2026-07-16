import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      if (res.data.success) {
        const data = res.data.data;
        const loggedUser = {
          id: data.id,
          fullName: data.fullName,
          email: data.email,
          role: data.role,
        };
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  const googleLogin = async (idToken) => {
    try {
      const res = await api.post('/api/auth/google', idToken, {
        headers: { 'Content-Type': 'text/plain' },
      });
      if (res.data.success) {
        const data = res.data.data;
        const loggedUser = {
          id: data.id,
          fullName: data.fullName,
          email: data.email,
          role: data.role,
        };
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Google login failed' };
    }
  };

  const register = async (fullName, email, password, confirmPassword, mobileNumber) => {
    try {
      const res = await api.post('/api/auth/register', {
        fullName,
        email,
        password,
        confirmPassword,
        mobileNumber,
      });
      return res.data;
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const updateProfileState = (updatedUser) => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const newUser = { ...savedUser, ...updatedUser };
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin, register, logout, updateProfileState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
