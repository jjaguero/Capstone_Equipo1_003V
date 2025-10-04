import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { User } from '@/@types/entities';

/**
 * Hook to fetch users from backend
 * NO business logic - just HTTP calls to NestJS
 */

export const useUsers = (filters?: { role?: string; homeId?: string }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  /**
   * Fetch all users from backend with optional filters
   */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.role) params.append('role', filters.role);
      if (filters?.homeId) params.append('homeId', filters.homeId);

      const response = await apiClient.get<User[]>(ENDPOINTS.USERS, { params });
      setUsers(response.data);
    } catch (err) {
      setError('Error al cargar usuarios');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch single user by ID
   */
  const getUserById = async (id: string): Promise<User | null> => {
    try {
      const response = await apiClient.get<User>(ENDPOINTS.USER_BY_ID(id));
      return response.data;
    } catch (err) {
      console.error('Error fetching user:', err);
      return null;
    }
  };

  /**
   * Create new user
   */
  const createUser = async (userData: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.post<User>(ENDPOINTS.USERS, userData);
      await fetchUsers(); // Refresh list
      return response.data;
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  };

  /**
   * Update user
   */
  const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.patch<User>(ENDPOINTS.USER_BY_ID(id), userData);
      await fetchUsers(); // Refresh list
      return response.data;
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  };

  /**
   * Delete user
   */
  const deleteUser = async (id: string): Promise<void> => {
    try {
      await apiClient.delete(ENDPOINTS.USER_BY_ID(id));
      await fetchUsers(); // Refresh list
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
  };
};
