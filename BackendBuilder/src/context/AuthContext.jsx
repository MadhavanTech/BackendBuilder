import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

const normalizeUser = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const directUser = payload.user && typeof payload.user === 'object' ? payload.user : null;
  const directDataUser = payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data) ? payload.data : null;
  const fallbackDataUser = directDataUser && directDataUser.user && typeof directDataUser.user === 'object' ? directDataUser.user : null;
  const candidate = directUser || fallbackDataUser || directDataUser || payload;

  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const user = candidate.user && typeof candidate.user === 'object' ? candidate.user : candidate;

  if (!user || typeof user !== 'object') {
    return null;
  }

  const normalizedId = user.id || user.userId || user.userID || user.user_id || user._id || null;
  const normalizedUser = {
    ...user,
    id: normalizedId,
    userId: user.userId || normalizedId,
    userID: user.userID || normalizedId,
    user_id: user.user_id || normalizedId,
  };

  const isAuthenticated = Boolean(
    normalizedUser.authenticated === true ||
    user.authenticated === true ||
    payload.authenticated === true ||
    payload.isAuthenticated === true ||
    candidate.authenticated === true ||
    directDataUser?.authenticated === true
  );
  const hasIdentity = !!(normalizedUser.id || normalizedUser.userId || normalizedUser.email || normalizedUser.username || normalizedUser.name);

  if (!isAuthenticated && !hasIdentity) {
    return null;
  }

  return {
    ...normalizedUser,
    authenticated: isAuthenticated || hasIdentity,
  };
};

const tryLoginRequest = async (email, password) => {
  const endpoints = ['/auth/login', '/api/auth/login', '/login'];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await client.post(endpoint, { email, password });
      return response;
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      if (status === 404 || status === 405) {
        continue;
      }
      throw error;
    }
  }

  throw lastError;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const authRequestId = useRef(0);

  const fetchCurrentUser = async (isCancelled = () => false) => {
    const requestId = ++authRequestId.current;
    const isStale = () => isCancelled() || requestId !== authRequestId.current;

    if (isStale()) {
      return null;
    }

    setLoading(true);

    try {
      const { data } = await client.get('/auth/me');
      const nextUser = normalizeUser(data);

      if (isStale()) {
        return null;
      }

      setUser(nextUser);
      return nextUser;
    } catch (error) {
      if (isStale()) {
        return null;
      }

      if (error?.response?.status === 401) {
        setUser(null);
        return null;
      }

      setUser(null);
      return null;
    } finally {
      if (!isStale()) {
        setLoading(false);
      }
    }
  };

  const login = async (email, password) => {
    authRequestId.current += 1;
    setLoading(true);

    try {
      const response = await tryLoginRequest(email, password);
      const payload = response?.data ?? {};
      const nextUser = normalizeUser(payload.user ?? payload.data ?? payload);

      if (nextUser) {
        setUser(nextUser);
        setLoading(false);
        return nextUser;
      }

      const currentUserResponse = await client.get('/auth/me').catch(() => client.get('/api/auth/me')).catch(() => null);
      const currentUser = normalizeUser(currentUserResponse?.data ?? currentUserResponse ?? null);

      if (!currentUser) {
        throw new Error('Invalid email or password');
      }

      setUser(currentUser);
      setLoading(false);
      return currentUser;
    } catch (error) {
      setUser(null);
      setLoading(false);
      throw error;
    }
  };

  const register = async (payload) => {
    const response = await client.post('/auth/register', payload);
    return response.data;
  };

  const logout = async () => {
    try {
      await client.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    let cancelled = false;

    fetchCurrentUser(() => cancelled);

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const interceptor = client.interceptors.response.use(
      (response) => response,
      (error) => {
        const url = error?.config?.url || '';
        const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/me');

        if (error?.response?.status === 401 && !isAuthRequest) {
          setUser(null);
          window.location.assign('/login');
        }

        return Promise.reject(error);
      }
    );

    return () => {
      client.interceptors.response.eject(interceptor);
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser: fetchCurrentUser,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}

export default AuthContext;
