import { Card } from '@/components/ui';
import { useSensors } from '@/features/sensors/hooks/useSensors';
import { useConsumption } from '@/hooks/useConsumption';
import { useAlerts } from '@/hooks/useAlerts';
import { useAquaTrackingAuth } from '@/features/auth/hooks/useAquaTrackingAuth';
import { useEffect } from 'react';

const UserDashboard = () => {
  const { currentUser } = useAquaTrackingAuth();
  const { sensors, loading: sensorsLoading } = useSensors(currentUser?.homeId);
  const { consumptions, loading: consumptionLoading } = useConsumption(currentUser?.homeId);
  const { alerts, loading: alertsLoading } = useAlerts(currentUser?.homeId);

  const activeSensors = sensors.filter(s => s.status === 'active').length;
  const totalSensors = sensors.length;
  const unresolvedAlerts = alerts.filter(a => !a.resolved).length;
  const todayConsumption = consumptions[0]?.totalLiters || 0;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="mb-2">Bienvenido, {currentUser?.name}</h3>
        <p className="text-gray-500">Monitoreo de consumo de agua en tiempo real</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex flex-col">
            <span className="text-gray-500 text-sm">Consumo Hoy</span>
            <span className="text-2xl font-bold">{todayConsumption.toFixed(2)} L</span>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col">
            <span className="text-gray-500 text-sm">Sensores Activos</span>
            <span className="text-2xl font-bold">{activeSensors}/{totalSensors}</span>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col">
            <span className="text-gray-500 text-sm">Alertas Pendientes</span>
            <span className="text-2xl font-bold text-red-500">{unresolvedAlerts}</span>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col">
            <span className="text-gray-500 text-sm">Límite Diario</span>
            <span className="text-2xl font-bold">{currentUser?.limitLitersPerDay || 0} L</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card header={{ content: <h5>Mis Sensores</h5> }}>
          {sensorsLoading ? (
            <p>Cargando sensores...</p>
          ) : sensors.length === 0 ? (
            <p className="text-gray-500">No hay sensores instalados</p>
          ) : (
            <div className="flex flex-col gap-2">
              {sensors.map((sensor) => (
                <div key={sensor._id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-semibold">{sensor.category}</p>
                    <p className="text-sm text-gray-500">{sensor.location}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    sensor.status === 'active' ? 'bg-green-100 text-green-700' :
                    sensor.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {sensor.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card header={{ content: <h5>Alertas Recientes</h5> }}>
          {alertsLoading ? (
            <p>Cargando alertas...</p>
          ) : alerts.length === 0 ? (
            <p className="text-gray-500">No hay alertas</p>
          ) : (
            <div className="flex flex-col gap-2">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert._id} className="flex flex-col p-3 border rounded">
                  <p className="font-semibold text-sm">{alert.type}</p>
                  <p className="text-sm text-gray-600">{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(alert.triggeredAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
