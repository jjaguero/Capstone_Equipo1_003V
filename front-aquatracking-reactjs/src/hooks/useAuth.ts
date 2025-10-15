import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type { User } from '../@types/entities';

/**
 * Hook for authentication
 * Calls backend endpoints directly - NO business logic here
 */

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // localStorage persiste al cerrar el navegador
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  /**
   * Login by email and password
   * Calls backend to validate credentials
   */
  const login = async (email: string, password: string): Promise<User> => {
    try {
      // Call backend to find user by email
      const response = await apiClient.get<User>(ENDPOINTS.USER_BY_EMAIL(email));
      const user = response.data;


      // For now, basic validation (replace with proper JWT auth)
      if (user && user.password === password) {
        // Usar localStorage para que persista al cerrar el navegador
        localStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentUser(user);
        return user;
      } else {
        throw new Error('Credenciales inválidas');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  /**
   * Logout - clear local state
   */
  const logout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('serverSessionId');
    localStorage.removeItem('authToken');
    setCurrentUser(null);
  };

  const isAdmin = (): boolean => {
    return currentUser?.role === 'admin';
  };

  const isAuthenticated = (): boolean => {
    return currentUser !== null;
  };

  return {
    currentUser,
    loading,
    login,
    logout,
    isAdmin,
    isAuthenticated,
  };
};
