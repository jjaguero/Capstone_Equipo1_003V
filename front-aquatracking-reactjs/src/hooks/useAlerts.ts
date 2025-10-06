import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type { Alert } from '../@types/entities';

/**
 * Hook to fetch alerts from backend
 * NO business logic - just HTTP calls to NestJS
 */

export const useAlerts = (homeId?: string) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useAlerts - homeId:', homeId)
    if (homeId) {
      fetchAlertsByHome(homeId);
    } else {
      // Si no hay homeId, no buscar alertas (para usuarios sin hogar asignado)
      setAlerts([])
      setLoading(false)
      setError(null)
    }
  }, [homeId]);

  /**
   * Fetch all alerts
   */
  const fetchAllAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<Alert[]>(ENDPOINTS.ALERTS);
      setAlerts(response.data);
    } catch (err) {
      setError('Error al cargar alertas');
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch alerts by homeId
   */
  const fetchAlertsByHome = async (homeId: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('useAlerts - Fetching alerts for homeId:', homeId);
      console.log('useAlerts - API endpoint:', ENDPOINTS.ALERTS_BY_HOME(homeId));
      
      const response = await apiClient.get<Alert[]>(ENDPOINTS.ALERTS_BY_HOME(homeId));
      
      console.log('useAlerts - API Response:', response.data);
      console.log('useAlerts - Found alerts count:', response.data.length);
      
      setAlerts(response.data);
    } catch (err) {
      console.error('useAlerts - Error fetching alerts by home:', err);
      console.error('useAlerts - Error details:', {
        homeId,
        endpoint: ENDPOINTS.ALERTS_BY_HOME(homeId),
        error: err
      });
      setError('Error al cargar alertas del hogar');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch unresolved alerts by homeId
   */
  const fetchUnresolvedAlertsByHome = async (homeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<Alert[]>(
        ENDPOINTS.UNRESOLVED_ALERTS_BY_HOME(homeId)
      );
      setAlerts(response.data);
    } catch (err) {
      setError('Error al cargar alertas no resueltas');
      console.error('Error fetching unresolved alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get single alert by ID
   */
  const getAlertById = async (id: string): Promise<Alert | null> => {
    try {
      const response = await apiClient.get<Alert>(ENDPOINTS.ALERT_BY_ID(id));
      return response.data;
    } catch (err) {
      console.error('Error fetching alert:', err);
      return null;
    }
  };

  /**
   * Create new alert
   */
  const createAlert = async (alertData: Partial<Alert>): Promise<Alert> => {
    try {
      const response = await apiClient.post<Alert>(ENDPOINTS.ALERTS, alertData);
      if (homeId) {
        await fetchAlertsByHome(homeId);
      } else {
        await fetchAllAlerts();
      }
      return response.data;
    } catch (err) {
      console.error('Error creating alert:', err);
      throw err;
    }
  };

  /**
   * Update existing alert
   */
  const updateAlert = async (id: string, updateData: Partial<Alert>): Promise<Alert> => {
    try {
      const response = await apiClient.patch<Alert>(ENDPOINTS.ALERT_BY_ID(id), updateData);
      if (homeId) {
        await fetchAlertsByHome(homeId);
      } else {
        await fetchAllAlerts();
      }
      return response.data;
    } catch (err) {
      console.error('Error updating alert:', err);
      throw err;
    }
  };

  /**
   * Delete alert by ID
   */
  const deleteAlert = async (id: string): Promise<void> => {
    try {
      await apiClient.delete(ENDPOINTS.ALERT_BY_ID(id));
      if (homeId) {
        await fetchAlertsByHome(homeId);
      } else {
        await fetchAllAlerts();
      }
    } catch (err) {
      console.error('Error deleting alert:', err);
      throw err;
    }
  };

  return {
    alerts,
    loading,
    error,
    fetchAllAlerts,
    fetchAlertsByHome,
    fetchUnresolvedAlertsByHome,
    getAlertById,
    createAlert,
    updateAlert,
    deleteAlert,
    refetch: homeId ? () => fetchAlertsByHome(homeId) : fetchAllAlerts,
  };
};