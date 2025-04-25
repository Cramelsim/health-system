import React, { createContext, useContext, useState, useEffect } from 'react';
import { setAccessToken } from './api'; // <-- update this if it's in a different path

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Utility: Check if token is expired
  const checkTokenExpiration = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch (error) {
      console.error('Error decoding token:', error);
      return false;
    }
  };

  // Load user on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && checkTokenExpiration()) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.identity?.id || payload.id,
          username: payload.identity?.username || payload.username,
          role: payload.identity?.role || payload.role
        });
        setAccessToken(token);
      } catch (error) {
        console.error('Token validation failed:', error);
        localStorage.removeItem('accessToken');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('accessToken', data.access_token);
      setAccessToken(data.access_token);

      const payload = JSON.parse(atob(data.access_token.split('.')[1]));
      setUser({
        id: payload.identity?.id || payload.id,
        username: payload.identity?.username || payload.username,
        role: payload.identity?.role || payload.role
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user && checkTokenExpiration()
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
