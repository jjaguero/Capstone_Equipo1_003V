import { useEffect, useState } from 'react';

import { Card, Button, Progress, Badge, Spinner } from '@/components/ui';
import { useSensors } from '../hooks/useSensors';
import { normalizeSensorName } from '@/utils/sensor-name.utils';
import { apiClient } from '@/api/client';

import { 
  PiArrowLeftBold,
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
  // const { sensorId } = useParams<{ sensorId: string }>();
  const sensorId = window.location.pathname.split('/').pop();
  // const navigate = useNavigate();
  const { sensors, loading: sensorsLoading } = useSensors();
  
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensor = sensors.find(s => s._id === sensorId);

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

  // Cargar datos del sensor desde la API
  const loadSensorData = async () => {
    if (!sensorId) return;
    
    setLoading(true);
    setError(null);
    
    try {
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
        monthlyUsage: weeklyUsage, // Mostrar últimos 7 días como "mensual"
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
    if (sensor && sensorId) {
      loadSensorData();
    }
  }, [sensor, sensorId]);

  if (sensorsLoading || loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!sensor) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Sensor no encontrado</p>
          <Button onClick={handleBack}>
            <PiArrowLeftBold className="w-4 h-4 mr-2" />
            Volver a Sensores
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <Button variant="plain" onClick={handleBack}>
            <PiArrowLeftBold className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
        <Card className="bg-red-50 border border-red-200">
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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="plain" onClick={handleBack}>
            <PiArrowLeftBold className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {normalizeSensorName(sensor.subType || 'sensor')}
            </h1>
            <div className="flex items-center space-x-2 text-gray-600 mt-1">
              <PiMapPinDuotone className="w-4 h-4" />
              <span>{normalizeSensorName(sensor.location || '')}</span>
            </div>
          </div>
        </div>
        <Badge className={`text-${getStatusColor(sensor.status || '')}-600 bg-${getStatusColor(sensor.status || '')}-100`}>
          {sensor.status || 'Desconocido'}
        </Badge>
      </div>

      {/* Información del Sensor */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Información del Sensor</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Número de Serie</label>
              <p className="text-gray-900 font-mono">{sensor.serialNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Categoría</label>
              <p className="text-gray-900">{sensor.category}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Ubicación</label>
              <p className="text-gray-900">{normalizeSensorName(sensor.location || '')}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Estadísticas de Consumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Hoy</p>
                <p className="text-2xl font-bold text-blue-600">{stats.todayUsage.toFixed(1)}L</p>
              </div>
              <PiDropDuotone className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Esta Semana</p>
                <p className="text-2xl font-bold text-green-600">{stats.weeklyUsage.toFixed(1)}L</p>
              </div>
              <PiCalendarDuotone className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Promedio Diario</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averageDaily.toFixed(1)}L</p>
              </div>
              <PiChartBarDuotone className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Mediciones</p>
                <p className="text-2xl font-bold text-orange-600">{stats.totalMeasurements}</p>
              </div>
              <PiClockDuotone className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Consumo por Hora */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <PiClockDuotone className="w-5 h-5 mr-2 text-blue-600" />
            Consumo por Hora (Hoy)
          </h2>
          {stats.hourlyConsumption.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Hora</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Consumo (L)</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Eventos</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Duración Prom.</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.hourlyConsumption.map((hourData) => (
                    <tr key={hourData.hour} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {String(hourData.hour).padStart(2, '0')}:00
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-blue-600">{hourData.liters.toFixed(2)}L</span>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600">{hourData.count}</td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {Math.floor(hourData.avgDuration / 60)}m {Math.floor(hourData.avgDuration % 60)}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <PiClockDuotone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No hay datos de consumo por hora disponibles</p>
            </div>
          )}
        </div>
      </Card>

      {/* Últimos 7 Días */}
      {stats.last7Days.length > 0 && (
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <PiCalendarDuotone className="w-5 h-5 mr-2 text-green-600" />
              Últimos 7 Días
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Fecha</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Consumo (L)</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Eventos</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.last7Days.map((dayData) => (
                    <tr key={dayData.date} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{dayData.date}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-green-600">{dayData.liters.toFixed(2)}L</span>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600">{dayData.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* Mediciones Recientes */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Mediciones Recientes</h2>
          <div className="space-y-3">
            {stats.recentMeasurements.map((measurement) => (
              <div 
                key={measurement._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {measurement.liters.toFixed(1)} litros
                    </p>
                    <p className="text-sm text-gray-500">
                      Duración: {Math.floor(measurement.durationSec / 60)}m {measurement.durationSec % 60}s
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(measurement.startTime), 'HH:mm', { locale: es })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(measurement.startTime), 'dd/MM/yyyy', { locale: es })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {stats.recentMeasurements.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <PiDropDuotone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No hay mediciones recientes disponibles</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SensorDetailPage;