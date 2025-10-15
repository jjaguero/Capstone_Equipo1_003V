import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export interface SystemTrend {
  date: string;
  totalConsumption: number;
  averagePerHome: number;
}

export interface ConsumptionDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface HomeAlert {
  homeId: string;
  homeName: string;
  consumption: number;
  limit: number;
  percentageUsed: number;
  status: 'warning' | 'critical';
}

export const useSystemDashboard = () => {
  const [systemTrends, setSystemTrends] = useState<SystemTrend[]>([]);
  const [consumptionDistribution, setConsumptionDistribution] = useState<ConsumptionDistribution[]>([]);
  const [homesWithAlerts, setHomesWithAlerts] = useState<HomeAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [trendsResponse, distributionResponse, alertsResponse] = await Promise.all([
        apiClient.get<SystemTrend[]>('/daily-consumption/system/trends?days=30'),
        apiClient.get<ConsumptionDistribution[]>('/daily-consumption/system/distribution'),
        apiClient.get<HomeAlert[]>('/daily-consumption/system/alerts'),
      ]);

      setSystemTrends(trendsResponse.data);
      setConsumptionDistribution(distributionResponse.data);
      setHomesWithAlerts(alertsResponse.data);
    } catch (err) {
      setError('Error al cargar datos del dashboard');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  return {
    systemTrends,
    consumptionDistribution,
    homesWithAlerts,
    loading,
    error,
    refreshData,
  };
};