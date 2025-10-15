import { useEffect, useState } from 'react';

import { Card, Button, Progress, Badge } from '@/components/ui';
import { useSensors } from '../hooks/useSensors';
import { normalizeSensorName } from '@/utils/sensor-name.utils';

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

interface SensorDetailStats {
  todayUsage: number;
  weeklyUsage: number;
  monthlyUsage: number;
  averageDaily: number;
  recentMeasurements: Measurement[];
  totalMeasurements: number;
}

const SensorDetailPage = () => {
  // const { sensorId } = useParams<{ sensorId: string }>();
  const sensorId = window.location.pathname.split('/').pop();
  // const navigate = useNavigate();
  const { sensors, loading: sensorsLoading } = useSensors();
  // const { dailyConsumption, loading: consumptionLoading } = useConsumption();
  
  const [stats, setStats] = useState<SensorDetailStats>({
    todayUsage: 0,
    weeklyUsage: 0,
    monthlyUsage: 0,
    averageDaily: 0,
    recentMeasurements: [],
    totalMeasurements: 0
  });

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


  useEffect(() => {
    if (sensor) {

      const simulatedStats = {
        todayUsage: 45.8,
        weeklyUsage: 287.4,
        monthlyUsage: 1156.8,
        averageDaily: 41.1,
        recentMeasurements: [
          {
            _id: '1',
            liters: 12.5,
            durationSec: 180,
            startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 180000).toISOString(),
            createdAt: new Date().toISOString()
          },
          {
            _id: '2',
            liters: 8.3,
            durationSec: 120,
            startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() - 4 * 60 * 60 * 1000 + 120000).toISOString(),
            createdAt: new Date().toISOString()
          },
          {
            _id: '3',
            liters: 15.7,
            durationSec: 240,
            startTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() - 6 * 60 * 60 * 1000 + 240000).toISOString(),
            createdAt: new Date().toISOString()
          }
        ],
        totalMeasurements: 145
      };
      
      setStats(simulatedStats);
    }
  }, [sensor]);

  if (sensorsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
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