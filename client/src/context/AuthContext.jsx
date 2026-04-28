import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

export const AuthContext = createContext(null);

const storedUser = () => {
  try {
    return JSON.parse(localStorage.getItem('rydo_user'));
  } catch (error) {
    return null;
  }
};

/**
 * Provides JWT authentication, profile persistence, and role-based redirects.
 *
 * @param {{children: import('react').ReactNode}} props - Provider props.
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem('rydo_token'));
  const [user, setUser] = useState(() => storedUser());
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback((nextToken, nextUser) => {
    localStorage.setItem('rydo_token', nextToken);
    localStorage.setItem('rydo_user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const redirectForRole = useCallback(
    (role) => {
      navigate(role === 'driver' ? '/driver' : '/passenger', { replace: true });
    },
    [navigate]
  );

  useEffect(() => {
    const loadMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
        localStorage.setItem('rydo_user', JSON.stringify(data.user));
      } catch (error) {
        localStorage.removeItem('rydo_token');
        localStorage.removeItem('rydo_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadMe();
  }, [token]);

  const login = useCallback(
    async (email, password, expectedRole = '') => {
      const { data } = await api.post('/auth/login', { email, password });

      if (expectedRole && data.user.role !== expectedRole) {
        throw new Error(`This account is registered as ${data.user.role}`);
      }

      persistSession(data.token, data.user);
      toast.success('Logged in successfully');
      redirectForRole(data.user.role);
      return data.user;
    },
    [persistSession, redirectForRole]
  );

  const register = useCallback(
    async (payload) => {
      const { data } = await api.post('/auth/register', payload);
      persistSession(data.token, data.user);
      toast.success('Account created successfully');
      redirectForRole(data.user.role);
      return data.user;
    },
    [persistSession, redirectForRole]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('rydo_token');
    localStorage.removeItem('rydo_user');
    setToken(null);
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const updateStoredUser = useCallback((nextUser) => {
    localStorage.setItem('rydo_user', JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const value = useMemo(
    () => ({
      loading,
      login,
      logout,
      register,
      token,
      updateStoredUser,
      user
    }),
    [loading, login, logout, register, token, updateStoredUser, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
