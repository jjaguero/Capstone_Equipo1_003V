import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Home } from '@/@types/entities';


export const useHomes = (sectorId?: string) => {
  const [homes, setHomes] = useState<Home[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sectorId) {
      fetchHomesBySector(sectorId);
    } else {
      fetchAllHomes();
    }
  }, [sectorId]);
  const fetchAllHomes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<Home[]>(ENDPOINTS.HOMES);
      setHomes(response.data);
    } catch (err) {
      setError('Error al cargar hogares');
      console.error('Error fetching homes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHomesBySector = async (sectorId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<Home[]>(ENDPOINTS.HOMES_BY_SECTOR(sectorId));
      setHomes(response.data);
    } catch (err) {
      setError('Error al cargar hogares del sector');
      console.error('Error fetching homes by sector:', err);
    } finally {
      setLoading(false);
    }
  };

  const getHomeById = async (id: string): Promise<Home | null> => {
    try {
      const response = await apiClient.get<Home>(ENDPOINTS.HOME_BY_ID(id));
      return response.data;
    } catch (err) {
      console.error('Error fetching home:', err);
      return null;
    }
  };

  const createHome = async (homeData: Partial<Home>): Promise<Home> => {
    try {
      const response = await apiClient.post<Home>(ENDPOINTS.HOMES, homeData);
      if (sectorId) {
        await fetchHomesBySector(sectorId);
      } else {
        await fetchAllHomes();
      }
      return response.data;
    } catch (err) {
      console.error('Error creating home:', err);
      throw err;
    }
  };

  const updateHome = async (id: string, homeData: Partial<Home>): Promise<Home> => {
    try {
      const response = await apiClient.patch<Home>(ENDPOINTS.HOME_BY_ID(id), homeData);
      if (sectorId) {
        await fetchHomesBySector(sectorId);
      } else {
        await fetchAllHomes();
      }
      return response.data;
    } catch (err) {
      console.error('Error updating home:', err);
      throw err;
    }
  };

  const deleteHome = async (id: string): Promise<void> => {
    try {
      await apiClient.delete(ENDPOINTS.HOME_BY_ID(id));
      if (sectorId) {
        await fetchHomesBySector(sectorId);
      } else {
        await fetchAllHomes();
      }
    } catch (err) {
      console.error('Error deleting home:', err);
      throw err;
    }
  };

  return {
    homes,
    loading,
    error,
    fetchAllHomes,
    fetchHomesBySector,
    getHomeById,
    createHome,
    updateHome,
    deleteHome,
  };
};
