import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Sensor } from '@/@types/entities';

/**
 * Hook to fetch sensors from backend
 * NO business logic - just HTTP calls to NestJS
 */

export const useSensors = (homeId?: string, fetchAll = false) => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useSensors - homeId:', homeId, 'fetchAll:', fetchAll)
    if (homeId) {
      // Buscar sensores de una casa específica (vista de usuario)
      fetchSensorsByHome(homeId);
    } else if (fetchAll) {
      // Buscar todos los sensores (vista de admin)
      fetchAllSensors();
    } else {
      // Si no hay homeId y no es fetchAll, no buscar sensores
      setSensors([])
      setLoading(false)
      setError(null)
    }
  }, [homeId, fetchAll]);

  /**
   * Fetch all sensors from backend
   */
  const fetchAllSensors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<Sensor[]>(ENDPOINTS.SENSORS);
      setSensors(response.data);
    } catch (err) {
      setError('Error al cargar sensores');
      console.error('Error fetching sensors:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch sensors by homeId
   */
  const fetchSensorsByHome = async (homeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<Sensor[]>(ENDPOINTS.SENSORS_BY_HOME(homeId));
      setSensors(response.data);
    } catch (err) {
      setError('Error al cargar sensores del hogar');
      console.error('Error fetching sensors by home:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get single sensor by ID
   */
  const getSensorById = async (id: string): Promise<Sensor | null> => {
    try {
      const response = await apiClient.get<Sensor>(ENDPOINTS.SENSOR_BY_ID(id));
      return response.data;
    } catch (err) {
      console.error('Error fetching sensor:', err);
      return null;
    }
  };

  /**
   * Create new sensor
   */
  const createSensor = async (sensorData: Partial<Sensor>): Promise<Sensor> => {
    try {
      const response = await apiClient.post<Sensor>(ENDPOINTS.SENSORS, sensorData);
      if (homeId) {
        await fetchSensorsByHome(homeId);
      } else {
        await fetchAllSensors();
      }
      return response.data;
    } catch (err) {
      console.error('Error creating sensor:', err);
      throw err;
    }
  };

  /**
   * Update sensor
   */
  const updateSensor = async (id: string, sensorData: Partial<Sensor>): Promise<Sensor> => {
    try {
      const response = await apiClient.patch<Sensor>(ENDPOINTS.SENSOR_BY_ID(id), sensorData);
      if (homeId) {
        await fetchSensorsByHome(homeId);
      } else {
        await fetchAllSensors();
      }
      return response.data;
    } catch (err) {
      console.error('Error updating sensor:', err);
      throw err;
    }
  };

  /**
   * Delete sensor
   */
  const deleteSensor = async (id: string): Promise<void> => {
    try {
      await apiClient.delete(ENDPOINTS.SENSOR_BY_ID(id));
      if (homeId) {
        await fetchSensorsByHome(homeId);
      } else {
        await fetchAllSensors();
      }
    } catch (err) {
      console.error('Error deleting sensor:', err);
      throw err;
    }
  };

  return {
    sensors,
    loading,
    error,
    fetchAllSensors,
    fetchSensorsByHome,
    getSensorById,
    createSensor,
    updateSensor,
    deleteSensor,
  };
};
