import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type { Measurement, DailyConsumption } from '../@types/entities';
import { startOfDay, endOfDay } from 'date-fns';
import { useWebSocket } from './useWebSocket';

export const useTodayConsumption = (homeId?: string) => {
  const [todayLiters, setTodayLiters] = useState(0);
  const [lastMeasurementTime, setLastMeasurementTime] = useState<Date | null>(null);
  const [latestDate, setLatestDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const { newMeasurement } = useWebSocket();

  useEffect(() => {
    if (homeId) {
      fetchLatestDayConsumption(homeId);
    } else {
      setTodayLiters(0);
      setLastMeasurementTime(null);
      setLatestDate(null);
      setLoading(false);
    }
  }, [homeId]);

  // Actualizar cuando llega una nueva medición por WebSocket
  useEffect(() => {
    if (newMeasurement && homeId) {
      // Agregar los litros de la nueva medición
      setTodayLiters(prev => prev + newMeasurement.liters);
      setLastMeasurementTime(new Date(newMeasurement.endTime));
    }
  }, [newMeasurement, homeId]);

  const fetchLatestDayConsumption = async (homeId: string) => {
    try {
      setLoading(true);
      
      // Obtener las mediciones más recientes del hogar
      const measurementsResponse = await apiClient.get<Measurement[]>(
        `${ENDPOINTS.MEASUREMENTS_BY_HOME(homeId)}&limit=1000`
      );
      
      const measurements = measurementsResponse.data;
      
      if (measurements.length === 0) {
        setTodayLiters(0);
        setLastMeasurementTime(null);
        setLatestDate(null);
        setLoading(false);
        return;
      }
      
      // Ordenar por fecha más reciente primero
      const sortedMeasurements = [...measurements].sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
      
      // Obtener la última medición (más reciente)
      const latestMeasurement = sortedMeasurements[0];
      const latestMeasurementTime = new Date(latestMeasurement.endTime);
      const latestDate = new Date(latestMeasurement.startTime);
      const latestDayStart = startOfDay(latestDate);
      
      // Filtrar todas las mediciones desde el inicio del día HASTA la última medición
      const measurementsUntilNow = measurements.filter(m => {
        const measurementDate = new Date(m.startTime);
        const measurementEnd = new Date(m.endTime);
        return measurementDate >= latestDayStart && measurementEnd <= latestMeasurementTime;
      });
      
      // Calcular total de litros acumulados HASTA la última medición
      const totalLitersUntilNow = measurementsUntilNow.reduce((sum, m) => sum + m.liters, 0);
      
      setTodayLiters(totalLitersUntilNow);
      setLastMeasurementTime(latestMeasurementTime);
      setLatestDate(latestDate);
      
      console.log('Consumption until last measurement:', {
        date: latestDate,
        lastMeasurementTime: latestMeasurementTime,
        totalLitersUntilNow,
        measurementsCount: measurementsUntilNow.length,
      });
    } catch (err) {
      console.error('Error fetching latest day consumption:', err);
      setTodayLiters(0);
      setLastMeasurementTime(null);
      setLatestDate(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    todayLiters,
    lastMeasurementTime,
    latestDate,
    loading,
    refetch: () => homeId && fetchLatestDayConsumption(homeId),
  };
};
