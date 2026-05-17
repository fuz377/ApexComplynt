import { useState, useEffect, useCallback } from 'react';
import { User, RegisterData, LoginData, ApiError } from '../types';
import { api } from '../services/api';

export interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isCheckingAuth: boolean;
  error: string | null;
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false); // ✅ FIXED
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // ✅ NEW
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const response = await api.getMe();
      setUser(response.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setIsCheckingAuth(false); // ✅ don't block buttons
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.register(data);
      setUser(response.data.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.login(data);
      setUser(response.data.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
      setUser(null);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isLoading,
    isCheckingAuth,
    error,
    register,
    login,
    logout,
    clearError,
  };
};