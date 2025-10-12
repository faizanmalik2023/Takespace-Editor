'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for existing authentication on mount
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
      
      if (accessToken && userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password, keepSignedIn = false) => {
    try {
      setLoading(true);
      
      // Import api dynamically to avoid circular dependency
      const { api } = await import('../lib/api');
      const response = await api.login(username, password);
      
      const data = response?.data || response;
      const access = data?.tokens?.access || data?.access;
      const refresh = data?.tokens?.refresh || data?.refresh;
      const userData = data?.user || data?.data?.user;
      
      if (access && userData) {
        const storage = keepSignedIn ? localStorage : sessionStorage;
        storage.setItem('access_token', access);
        if (refresh) storage.setItem('refresh_token', refresh);
        storage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        toast.success('Login successful!');
        return { success: true };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      // Clear all auth data
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('user');
      
      setUser(null);
      setIsAuthenticated(false);
      
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout');
    }
  };

  const clearAuth = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    clearAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
