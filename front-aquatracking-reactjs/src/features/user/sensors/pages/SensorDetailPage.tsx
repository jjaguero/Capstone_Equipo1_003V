import { useEffect, useState } from 'react';

import { Card, Button, Progress, Badge, Spinner } from '@/components/ui';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { normalizeSensorName } from '@/utils/sensor-name.utils';
import { apiClient } from '@/api/client';

import { 
  PiMapPinDuotone,
  PiDropDuotone,
  PiClockDuotone,
  PiCalendarDuotone,
  PiChartBarDuotone
} from 'react-icons/pi';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

interface Measurement {
  _id: string;
  liters: number;
  durationSec: number;
  startTime: string;
  endTime: string;
  createdAt: string;
}

interface HourlyConsumption {
  hour: number;
  liters: number;
  count: number;
  avgDuration: number;
}

interface SensorDetailStats {
  todayUsage: number;
  weeklyUsage: number;
  monthlyUsage: number;
  averageDaily: number;
  recentMeasurements: Measurement[];
  totalMeasurements: number;
  hourlyConsumption: HourlyConsumption[];
  last7Days: Array<{ date: string; liters: number; count: number }>;
}

const SensorDetailPage = () => {
  const sensorId = window.location.pathname.split('/').pop();
  
  const [sensor, setSensor] = useState<any>(null);
  const [stats, setStats] = useState<SensorDetailStats>({
    todayUsage: 0,
    weeklyUsage: 0,
    monthlyUsage: 0,
    averageDaily: 0,
    recentMeasurements: [],
    totalMeasurements: 0,
    hourlyConsumption: [],
    last7Days: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'activo':
        return 'emerald';
      case 'inactivo':
        return 'red';
      case 'mantenimiento':
        return 'amber';
      default:
        return 'slate';
    }
  };

  const handleBack = () => {
    window.location.href = '/user/sensors';
  };

  // Cargar sensor y sus datos desde la API
  const loadSensorData = async () => {
    if (!sensorId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Primero obtener el sensor
      const sensorRes = await apiClient.get(`/sensors/${sensorId}`);
      setSensor(sensorRes.data);
      
      // Obtener datos de hoy, últimos 7 días y mediciones recientes en paralelo
      const [todayRes, last7Res, recentRes] = await Promise.all([
        apiClient.get(`/measurements/sensor/${sensorId}/today`),
        apiClient.get(`/measurements/sensor/${sensorId}/last-7-days`),
        apiClient.get(`/measurements/sensor/${sensorId}/recent?limit=10`),
      ]);

      const todayData = todayRes.data;
      const last7Data = last7Res.data || [];
      const recentMeasurements = recentRes.data || [];

      // Calcular totales
      const todayUsage = todayData.totalLiters || 0;
      const weeklyUsage = last7Data.reduce((sum: number, day: any) => sum + (day.liters || 0), 0);
      const averageDaily = weeklyUsage > 0 ? weeklyUsage / Math.min(last7Data.length, 7) : 0;

      // Intentar obtener consumo por hora
      let hourlyConsumption: HourlyConsumption[] = [];
      try {
        const hourlyRes = await apiClient.get(`/measurements/sensor/${sensorId}/hourly`);
        hourlyConsumption = hourlyRes.data || [];
      } catch (err) {
        console.warn('No se pudo obtener consumo por hora:', err);
      }

      setStats({
        todayUsage,
        weeklyUsage,
        monthlyUsage: weeklyUsage,
        averageDaily,
        recentMeasurements,
        totalMeasurements: recentMeasurements.length,
        hourlyConsumption,
        last7Days: last7Data
      });
    } catch (err) {
      console.error('Error cargando datos del sensor:', err);
      setError('No se pudieron cargar los datos del sensor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sensorId) {
      loadSensorData();
    }
  }, [sensorId]);

  if (loading) {
    return (
      <div className="p-1">
        <div className="flex items-center justify-center h-96">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!sensor) {
    return (
      <div className="p-6">
        <Breadcrumb />
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Sensor no encontrado</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Breadcrumb />
        <Card className="bg-red-50 border border-red-200 mt-4">
          <div className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadSensorData}>
              Reintentar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-2 max-w-full">
      <Breadcrumb />
      
      {/* Header Compacto */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {normalizeSensorName(sensor.subType || 'sensor')}
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-1">
              <span className="flex items-center gap-1">
                <PiMapPinDuotone className="w-4 h-4" />
                {normalizeSensorName(sensor.location || '')}
              </span>
              <span className="font-mono text-xs">{sensor.serialNumber}</span>
            </div>
          </div>
          <Badge className={`text-${getStatusColor(sensor.status || '')}-600 bg-${getStatusColor(sensor.status || '')}-100`}>
            {sensor.status || 'Desconocido'}
          </Badge>
        </div>
      </div>

      {/* Estadísticas Compactas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <Card className="p-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Hoy</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.todayUsage.toFixed(1)}L</p>
            </div>
            <PiDropDuotone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Esta Semana</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.weeklyUsage.toFixed(1)}L</p>
            </div>
            <PiCalendarDuotone className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Promedio</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.averageDaily.toFixed(1)}L</p>
            </div>
            <PiChartBarDuotone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Mediciones</p>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{stats.totalMeasurements}</p>
            </div>
            <PiClockDuotone className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
        </Card>
      </div>

      {/* Grid de 2 columnas para tablas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-3">
        {/* Consumo por Hora */}
        <Card className="p-2">
          <h2 className="text-sm font-semibold mb-2 flex items-center text-gray-900 dark:text-gray-100">
            <PiClockDuotone className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
            Consumo por Hora (Hoy)
          </h2>
          {stats.hourlyConsumption.length > 0 ? (
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-white dark:bg-gray-900">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-1 px-2 font-semibold text-gray-600 dark:text-gray-400">Hora</th>
                    <th className="text-right py-1 px-2 font-semibold text-gray-600 dark:text-gray-400">Litros</th>
                    <th className="text-center py-1 px-2 font-semibold text-gray-600 dark:text-gray-400">Usos</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.hourlyConsumption.map((hourData) => (
                    <tr key={hourData.hour} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-1 px-2 font-medium text-gray-900 dark:text-gray-100">
                        {String(hourData.hour).padStart(2, '0')}:00
                      </td>
                      <td className="py-1 px-2 text-right">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{hourData.liters.toFixed(1)}L</span>
                      </td>
                      <td className="py-1 px-2 text-center text-gray-600 dark:text-gray-400">{hourData.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <PiClockDuotone className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
              <p className="text-xs">Sin datos</p>
            </div>
          )}
        </Card>

        {/* Últimos 7 Días */}
        {stats.last7Days.length > 0 && (
          <Card className="p-2">
            <h2 className="text-sm font-semibold mb-2 flex items-center text-gray-900 dark:text-gray-100">
              <PiCalendarDuotone className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
              Últimos 7 Días
            </h2>
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-white dark:bg-gray-900">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-1 px-2 font-semibold text-gray-600 dark:text-gray-400">Fecha</th>
                    <th className="text-right py-1 px-2 font-semibold text-gray-600 dark:text-gray-400">Litros</th>
                    <th className="text-center py-1 px-2 font-semibold text-gray-600 dark:text-gray-400">Usos</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.last7Days.map((dayData) => (
                    <tr key={dayData.date} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-1 px-2 font-medium text-gray-900 dark:text-gray-100">{dayData.date}</td>
                      <td className="py-1 px-2 text-right">
                        <span className="font-semibold text-green-600 dark:text-green-400">{dayData.liters.toFixed(1)}L</span>
                      </td>
                      <td className="py-1 px-2 text-center text-gray-600 dark:text-gray-400">{dayData.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Mediciones Recientes */}
      <Card className="p-2">
        <h2 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">Mediciones Recientes</h2>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {stats.recentMeasurements.map((measurement) => (
            <div 
              key={measurement._id}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {measurement.liters.toFixed(1)}L
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.floor(measurement.durationSec / 60)}m {measurement.durationSec % 60}s
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {format(new Date(measurement.startTime), 'HH:mm', { locale: es })}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(measurement.startTime), 'dd/MM', { locale: es })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {stats.recentMeasurements.length === 0 && (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <PiDropDuotone className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p className="text-xs">No hay mediciones recientes</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SensorDetailPage;