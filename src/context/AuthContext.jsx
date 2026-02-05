import { createContext, useContext, useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const getAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem('jwt', token);
  } else {
    localStorage.removeItem('jwt');
  }
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('guest');
  const [token, setToken] = useState(localStorage.getItem('jwt') || null);

  const hydrateSession = async (jwtToken) => {
    if (!jwtToken) {
      setCurrentUser(null);
      setRole('guest');
      setToken(null);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: getAuthHeaders(jwtToken),
      });

      if (!res.ok) {
        setStoredToken(null);
        setCurrentUser(null);
        setRole('guest');
        setToken(null);
        return;
      }

      const data = await res.json();
      if (data?.success && data?.user) {
        setCurrentUser(data.user);
        setRole(data.user.role || 'user');
        setToken(jwtToken);
      } else {
        setStoredToken(null);
        setCurrentUser(null);
        setRole('guest');
        setToken(null);
      }
    } catch (err) {
      setCurrentUser(null);
      setRole('guest');
      setToken(null);
    }
  };

  const signup = async (email, password, name) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.token) {
        return { success: false, error: data?.error || `HTTP ${res.status}`, code: 'backend/register-failed' };
      }

      setStoredToken(data.token);
      setToken(data.token);
      setCurrentUser(data.user || null);
      setRole(data.user?.role || 'user');
      return { success: true, user: data.user, role: data.user?.role || 'user' };
    } catch (error) {
      return { success: false, error: error.message, code: 'backend/register-failed' };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.token) {
        return { success: false, error: data?.error || `HTTP ${res.status}`, code: 'backend/login-failed' };
      }

      setStoredToken(data.token);
      setToken(data.token);
      setCurrentUser(data.user || null);
      setRole(data.user?.role || 'user');
      return { success: true, user: data.user, role: data.user?.role || 'user' };
    } catch (error) {
      return { success: false, error: error.message, code: 'backend/login-failed' };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: getAuthHeaders(token),
        });
      }
    } catch (error) {
      // Ignore logout errors; proceed to clear local session
    } finally {
      setStoredToken(null);
      setCurrentUser(null);
      setRole('guest');
      setToken(null);
    }

    return { success: true };
  };

  useEffect(() => {
    const initialToken = localStorage.getItem('jwt');
    hydrateSession(initialToken).finally(() => setLoading(false));
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loading,
    role,
    isAdmin: role === 'admin',
    token,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;