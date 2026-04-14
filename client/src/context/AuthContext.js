import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return true;
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token && !isTokenExpired(token)) {
      // ✅ Set temporary user to prevent redirect during fetch
      setUser({ temp: true });
      fetchUser();
    } else {
      if (token && isTokenExpired(token)) {
        localStorage.removeItem('token');
        console.log('Token expired, removed from storage');
      }
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      
      // ✅ CRITICAL FIX: Only remove token on 401 Unauthorized
      // Your api.js already handles 401 by redirecting, so we just clear state
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
      }
      // For network errors (no response), keep the user state as is
      // Don't remove token for network errors!
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        const userData = {
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          glowPoints: response.data.glowPoints || 0
        };
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, error: 'No token received' };
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Invalid email or password' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser({
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role
        });
        return { success: true };
      } else {
        return { success: false, error: 'Registration failed' };
      }
    } catch (error) {
      console.error('Register error:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user && !user.temp  // ✅ Don't consider loading state as authenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};