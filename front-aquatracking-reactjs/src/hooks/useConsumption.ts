import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type { DailyConsumption } from '../@types/entities';

/**
 * Hook to fetch daily consumption data from backend
 * NO business logic - just HTTP calls to NestJS
 */

export const useConsumption = (homeId?: string) => {
  const [consumptions, setConsumptions] = useState<DailyConsumption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (homeId) {
      fetchConsumptionByHome(homeId);
    } else {
      fetchAllConsumptions();
    }
  }, [homeId]);

  /**
   * Fetch all daily consumptions
   */
  const fetchAllConsumptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<DailyConsumption[]>(ENDPOINTS.DAILY_CONSUMPTION);
      setConsumptions(response.data);
    } catch (err) {
      setError('Error al cargar consumos');
      console.error('Error fetching consumptions:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch daily consumptions by homeId
   */
  const fetchConsumptionByHome = async (homeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<DailyConsumption[]>(
        ENDPOINTS.DAILY_CONSUMPTION_BY_HOME(homeId)
      );
      setConsumptions(response.data);
    } catch (err) {
      setError('Error al cargar consumos del hogar');
      console.error('Error fetching consumption by home:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get single consumption by ID
   */
  const getConsumptionById = async (id: string): Promise<DailyConsumption | null> => {
    try {
      const response = await apiClient.get<DailyConsumption>(
        ENDPOINTS.DAILY_CONSUMPTION_BY_ID(id)
      );
      return response.data;
    } catch (err) {
      console.error('Error fetching consumption:', err);
      return null;
    }
  };

  /**
   * Create new daily consumption record
   */
  const createConsumption = async (
    consumptionData: Partial<DailyConsumption>
  ): Promise<DailyConsumption> => {
    try {
      const response = await apiClient.post<DailyConsumption>(
        ENDPOINTS.DAILY_CONSUMPTION,
        consumptionData
      );
      if (homeId) {
        await fetchConsumptionByHome(homeId);
      } else {
        await fetchAllConsumptions();
      }
      return response.data;
    } catch (err) {
      console.error('Error creating consumption:', err);
      throw err;
    }
  };

  /**
   * Update consumption record
   */
  const updateConsumption = async (
    id: string,
    consumptionData: Partial<DailyConsumption>
  ): Promise<DailyConsumption> => {
    try {
      const response = await apiClient.patch<DailyConsumption>(
        ENDPOINTS.DAILY_CONSUMPTION_BY_ID(id),
        consumptionData
      );
      if (homeId) {
        await fetchConsumptionByHome(homeId);
      } else {
        await fetchAllConsumptions();
      }
      return response.data;
    } catch (err) {
      console.error('Error updating consumption:', err);
      throw err;
    }
  };

  /**
   * Delete consumption record
   */
  const deleteConsumption = async (id: string): Promise<void> => {
    try {
      await apiClient.delete(ENDPOINTS.DAILY_CONSUMPTION_BY_ID(id));
      if (homeId) {
        await fetchConsumptionByHome(homeId);
      } else {
        await fetchAllConsumptions();
      }
    } catch (err) {
      console.error('Error deleting consumption:', err);
      throw err;
    }
  };

  return {
    consumptions,
    loading,
    error,
    fetchAllConsumptions,
    fetchConsumptionByHome,
    getConsumptionById,
    createConsumption,
    updateConsumption,
    deleteConsumption,
  };
};
