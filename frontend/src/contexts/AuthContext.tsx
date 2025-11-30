import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, authApi } from '../api/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const initAuth = async () => {
      // Set a timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn('Auth initialization timeout, setting loading to false');
          setLoading(false);
        }
      }, 5000); // 5 second timeout

      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          try {
            const currentUser = await authApi.getCurrentUser();
            if (isMounted) {
              clearTimeout(timeoutId);
              setUser(currentUser);
              setLoading(false);
            }
          } catch (error: any) {
            if (isMounted) {
              clearTimeout(timeoutId);
              // Token is invalid or expired, remove it
              console.log('Token validation failed, clearing:', error.response?.status);
              localStorage.removeItem('accessToken');
              setUser(null);
              setLoading(false);
            }
          }
        } else {
          if (isMounted) {
            clearTimeout(timeoutId);
            setUser(null);
            setLoading(false);
          }
        }
      } catch (error) {
        if (isMounted) {
          clearTimeout(timeoutId);
          console.error('Auth initialization error:', error);
          setUser(null);
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await authApi.login({ email, password });
      if (data.user) {
        setUser(data.user);
      } else {
        throw new Error('Login failed: No user data received');
      }
    } catch (error: any) {
      // Re-throw the error so the LoginPage can handle it
      throw error;
    }
  };

  const register = async (registerData: any) => {
    const data = await authApi.register(registerData);
    setUser(data.user);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

