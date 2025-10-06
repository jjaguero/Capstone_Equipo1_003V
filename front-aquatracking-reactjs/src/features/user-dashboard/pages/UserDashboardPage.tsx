import { Card } from '@/components/ui'
import Container from '@/components/shared/Container'
import { useSensors } from '@/features/sensors/hooks/useSensors'
import { useConsumption } from '@/hooks/useConsumption'
import { useAlerts } from '@/hooks/useAlerts'
import { useAquaTrackingAuth } from '@/features/auth/hooks/useAquaTrackingAuth'
import { PiDropDuotone, PiDevicesDuotone, PiBellDuotone, PiTargetDuotone } from 'react-icons/pi'
import ConsumptionChart from '../components/ConsumptionChart'
import EcmeConsumptionTimelineCompact from '../components/EcmeConsumptionTimelineCompact'
import SensorStatusCard from '../components/SensorStatusCard'
import AlertsCard from '../components/AlertsCard'
import EmptyDataMessage from '../components/EmptyDataMessage'

const UserDashboardPage = () => {
  const { currentUser } = useAquaTrackingAuth()
  const { sensors, loading: sensorsLoading } = useSensors(currentUser?.homeId)
  const { consumptions, loading: consumptionLoading } = useConsumption(currentUser?.homeId)
  const { alerts, loading: alertsLoading } = useAlerts(currentUser?.homeId)

  const activeSensors = sensors.filter(s => s.status === 'active').length
  const totalSensors = sensors.length
  const unresolvedAlerts = alerts.filter(a => !a.resolved).length
  const todayConsumption = consumptions[0]?.totalLiters || 0

  // Si el usuario no tiene homeId asignado
  if (!currentUser?.homeId) {
    return (
      <Container>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Configuración Pendiente
            </h3>
            <p className="text-gray-600 mb-4">
              Tu cuenta no está asociada a un hogar aún. Contacta al administrador para completar la configuración.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Usuario:</strong> {currentUser?.name} ({currentUser?.email})
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Una vez asignado a un hogar, podrás ver toda la información de consumo y sensores.
              </p>
            </div>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      {/* Header */}
      <div className="mb-8 animate-fadeIn">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Bienvenido, {currentUser?.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Monitoreo de consumo de agua en tiempo real
        </p>
      </div>

      {/* KPIs Cards Mejoradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slideUp" style={{ animationDelay: '0.1s' }}>
        {/* Consumo Hoy */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200 rounded-full -translate-y-12 translate-x-12 opacity-30" />
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-blue-600 text-sm font-medium uppercase tracking-wide">Consumo Hoy</span>
                <div className="text-3xl font-bold text-blue-700 mt-1">
                  {todayConsumption.toFixed(1)}
                  <span className="text-lg text-blue-500 ml-1">L</span>
                </div>
                <div className="text-xs text-blue-500 mt-1">
                  {currentUser?.limitLitersPerDay ? 
                    `${((todayConsumption / currentUser.limitLitersPerDay) * 100).toFixed(0)}% del límite` :
                    'Sin límite configurado'
                  }
                </div>
              </div>
              <div className="relative">
                <PiDropDuotone className="text-5xl text-blue-500" />
                {todayConsumption > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Sensores Activos */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-200 rounded-full -translate-y-12 translate-x-12 opacity-30" />
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-emerald-600 text-sm font-medium uppercase tracking-wide">Sensores</span>
                <div className="text-3xl font-bold text-emerald-700 mt-1">
                  {activeSensors}
                  <span className="text-lg text-emerald-500 ml-1">/ {totalSensors}</span>
                </div>
                <div className="text-xs text-emerald-500 mt-1">
                  {activeSensors === totalSensors ? 'Todos operativos' : `${totalSensors - activeSensors} inactivos`}
                </div>
              </div>
              <div className="relative">
                <PiDevicesDuotone className="text-5xl text-emerald-500" />
                {activeSensors === totalSensors && totalSensors > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Alertas Pendientes */}
        <Card className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
          unresolvedAlerts > 0 
            ? 'bg-gradient-to-br from-red-50 to-rose-100' 
            : 'bg-gradient-to-br from-gray-50 to-slate-100'
        }`}>
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-12 translate-x-12 opacity-30 ${
            unresolvedAlerts > 0 ? 'bg-red-200' : 'bg-gray-200'
          }`} />
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className={`text-sm font-medium uppercase tracking-wide ${
                  unresolvedAlerts > 0 ? 'text-red-600' : 'text-gray-600'
                }`}>Alertas</span>
                <div className={`text-3xl font-bold mt-1 ${
                  unresolvedAlerts > 0 ? 'text-red-700' : 'text-gray-700'
                }`}>
                  {unresolvedAlerts}
                </div>
                <div className={`text-xs mt-1 ${
                  unresolvedAlerts > 0 ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {unresolvedAlerts > 0 ? 'Requieren atención' : 'Sin alertas activas'}
                </div>
              </div>
              <div className="relative">
                <PiBellDuotone className={`text-5xl ${
                  unresolvedAlerts > 0 ? 'text-red-500' : 'text-gray-400'
                }`} />
                {unresolvedAlerts > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unresolvedAlerts > 9 ? '9+' : unresolvedAlerts}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Límite Diario */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200 rounded-full -translate-y-12 translate-x-12 opacity-30" />
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-amber-600 text-sm font-medium uppercase tracking-wide">Límite Diario</span>
                <div className="text-3xl font-bold text-amber-700 mt-1">
                  {currentUser?.limitLitersPerDay || 0}
                  <span className="text-lg text-amber-500 ml-1">L</span>
                </div>
                <div className="text-xs text-amber-500 mt-1">
                  {currentUser?.limitLitersPerDay ? 
                    `${(currentUser.limitLitersPerDay - todayConsumption).toFixed(0)}L disponibles` :
                    'Sin límite configurado'
                  }
                </div>
              </div>
              <div className="relative">
                <PiTargetDuotone className="text-5xl text-amber-500" />
                {currentUser?.limitLitersPerDay && todayConsumption > currentUser.limitLitersPerDay && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="space-y-8 animate-slideUp" style={{ animationDelay: '0.2s' }}>
        {/* Si no hay datos, mostrar mensaje especial */}
        {!sensorsLoading && !consumptionLoading && !alertsLoading && 
         sensors.length === 0 && consumptions.length === 0 && alerts.length === 0 ? (
          <EmptyDataMessage homeId={currentUser.homeId!} userName={currentUser.name} />
        ) : (
          <>
            {/* Timeline de Consumo Compacto */}
            <div className="w-full">
              <EcmeConsumptionTimelineCompact 
                consumptions={consumptions} 
                loading={consumptionLoading}
                userLimit={currentUser?.limitLitersPerDay || 500}
              />
            </div>

            {/* Distribución de Sensores y Alertas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SensorStatusCard 
                sensors={sensors} 
                loading={sensorsLoading}
                onSensorClick={(sensor) => {
                  console.log('Ver detalles del sensor:', sensor)
                  // TODO: Navegar a detalle del sensor
                }}
              />
              
              <AlertsCard 
                alerts={alerts} 
                loading={alertsLoading}
                onAlertClick={(alert) => {
                  console.log('Ver detalle de alerta:', alert)
                  // TODO: Navegar a detalle de alerta
                }}
                onMarkAsRead={(alertId) => {
                  console.log('Marcar alerta como leída:', alertId)
                  // TODO: Implementar marcar como leída
                }}
              />
            </div>
          </>
        )}
      </div>
    </Container>
  )
}

export default UserDashboardPage