import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/app/types';
import { authApi } from '@/app/services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage and verify token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('cms_user');
      
      if (token && storedUser) {
        try {
          // Verify token is still valid by fetching current user
          const response = await authApi.getMe();
          if (response.success && response.data) {
            setUser(response.data);
            localStorage.setItem('cms_user', JSON.stringify(response.data));
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('cms_user');
          }
        } catch {
          // Error verifying token, use stored user data
          setUser(JSON.parse(storedUser));
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.login(email, password);
      
      if (response.success && response.data) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('cms_user', JSON.stringify(userData));
        return { success: true };
      }
      
      return { success: false, error: response.error || 'Login failed' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
    localStorage.removeItem('cms_user');
  }, []);

  const refreshUser = useCallback(async () => {
    const response = await authApi.getMe();
    if (response.success && response.data) {
      setUser(response.data);
      localStorage.setItem('cms_user', JSON.stringify(response.data));
    }
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
