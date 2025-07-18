import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    loading: true
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const storedToken = localStorage.getItem('buzzly_token');
    const storedUser = localStorage.getItem('buzzly_user');

    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({ user, token: storedToken, loading: false });
      } catch {
        localStorage.removeItem('buzzly_token');
        localStorage.removeItem('buzzly_user');
        setAuthState({ user: null, token: null, loading: false });
      }
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${backendUrl}/api/v1/auth/login`, { email, password }, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });

      localStorage.setItem('buzzly_token', res.data.token);
      localStorage.setItem('buzzly_user', JSON.stringify(res.data.user));

      setAuthState({ user: res.data.user, token: res.data.token, loading: false });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error?.response?.data?.error || 'Login failed'
      };
    }
  };

  const register = async (email, password, username) => {
    try {
      const res = await axios.post(`${backendUrl}/api/v1/auth/register`, { email, password, username }, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });

      localStorage.setItem('buzzly_token', res.data.token);
      localStorage.setItem('buzzly_user', JSON.stringify(res.data.user));

      setAuthState({ user: res.data.user, token: res.data.token, loading: false });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error?.response?.data?.error || 'Register failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('buzzly_token');
    localStorage.removeItem('buzzly_user');
    setAuthState({ user: null, token: null, loading: false });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
