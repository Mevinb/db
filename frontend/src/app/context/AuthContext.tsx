import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/app/types';
import { authApi } from '@/app/services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user and token from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('cms_user');
    const storedToken = localStorage.getItem('cms_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('cms_user', JSON.stringify(userData));
    // Token is already set by the authApi.login function
    const currentToken = localStorage.getItem('cms_token');
    setToken(currentToken);
  };

  const updateUser = (userData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...userData };
      localStorage.setItem('cms_user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    authApi.logout(); // This removes token and user from localStorage
  };

  const value = {
    user,
    token,
    login,
    updateUser,
    logout,
    isAuthenticated: !!user && !!token,
    isLoading,
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
