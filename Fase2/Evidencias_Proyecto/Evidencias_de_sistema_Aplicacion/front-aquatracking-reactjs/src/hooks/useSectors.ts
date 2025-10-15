import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type { Sector } from '../@types/entities';

/**
 * Hook to fetch sectors from backend
 * NO business logic - just HTTP calls to NestJS
 */

export const useSectors = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllSectors();
  }, []);

  /**
   * Fetch all sectors
   */
  const fetchAllSectors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<Sector[]>(ENDPOINTS.SECTORS);
      setSectors(response.data);
    } catch (err) {
      setError('Error al cargar sectores');
      console.error('Error fetching sectors:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get single sector by ID
   */
  const getSectorById = async (id: string): Promise<Sector | null> => {
    try {
      const response = await apiClient.get<Sector>(ENDPOINTS.SECTOR_BY_ID(id));
      return response.data;
    } catch (err) {
      console.error('Error fetching sector:', err);
      return null;
    }
  };

  /**
   * Create new sector
   */
  const createSector = async (sectorData: Partial<Sector>): Promise<Sector> => {
    try {
      const response = await apiClient.post<Sector>(ENDPOINTS.SECTORS, sectorData);
      await fetchAllSectors(); // Refresh list
      return response.data;
    } catch (err) {
      console.error('Error creating sector:', err);
      throw err;
    }
  };

  /**
   * Update sector
   */
  const updateSector = async (id: string, sectorData: Partial<Sector>): Promise<Sector> => {
    try {
      const response = await apiClient.patch<Sector>(ENDPOINTS.SECTOR_BY_ID(id), sectorData);
      await fetchAllSectors(); // Refresh list
      return response.data;
    } catch (err) {
      console.error('Error updating sector:', err);
      throw err;
    }
  };

  /**
   * Delete sector
   */
  const deleteSector = async (id: string): Promise<void> => {
    try {
      await apiClient.delete(ENDPOINTS.SECTOR_BY_ID(id));
      await fetchAllSectors(); // Refresh list
    } catch (err) {
      console.error('Error deleting sector:', err);
      throw err;
    }
  };

  return {
    sectors,
    loading,
    error,
    fetchAllSectors,
    getSectorById,
    createSector,
    updateSector,
    deleteSector,
  };
};
