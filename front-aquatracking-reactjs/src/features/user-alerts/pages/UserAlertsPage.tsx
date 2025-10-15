import { Card, Button } from '@/components/ui'
import Container from '@/components/shared/Container'
import { useAlerts } from '@/hooks/useAlerts'
import { useAquaTrackingAuth } from '@/features/auth/hooks/useAquaTrackingAuth'
import { 
  PiBellDuotone,
  PiWarningDuotone,
  PiCheckCircleDuotone,
  PiXCircleDuotone,
  PiArrowLeftDuotone,
  PiCalendarDuotone,
  PiDropDuotone
} from 'react-icons/pi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const UserAlertsPage = () => {
  const { currentUser } = useAquaTrackingAuth()
  const { alerts, loading } = useAlerts(currentUser?.homeId)

  const handleBackToDashboard = () => {
    window.location.href = '/user/overview'
  }

  const handleMarkAsResolved = (alertId: string) => {


  }

  if (!currentUser?.homeId) {
    return (
      <Container>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso no autorizado</h2>
            <p className="text-gray-600">No tienes permisos para ver esta sección.</p>
          </div>
        </div>
      </Container>
    )
  }

  const unresolvedAlerts = alerts.filter(alert => !alert.resolved)
  const resolvedAlerts = alerts.filter(alert => alert.resolved)

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'critical_consumption':
        return <PiWarningDuotone className="w-5 h-5 text-red-600" />
      case 'high_consumption':
        return <PiDropDuotone className="w-5 h-5 text-orange-600" />
      case 'sensor_offline':
        return <PiXCircleDuotone className="w-5 h-5 text-gray-600" />
      default:
        return <PiBellDuotone className="w-5 h-5 text-blue-600" />
    }
  }

  const getAlertTypeText = (type: string) => {
    switch (type) {
      case 'critical_consumption':
        return 'Consumo Crítico'
      case 'high_consumption':
        return 'Consumo Alto'
      case 'sensor_offline':
        return 'Sensor Desconectado'
      default:
        return type
    }
  }

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'critical_consumption':
        return 'bg-red-100 text-red-800'
      case 'high_consumption':
        return 'bg-orange-100 text-orange-800'
      case 'sensor_offline':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  if (loading) {
    return (
      <Container>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mis Alertas</h1>
              <p className="text-gray-600 mt-1">Notificaciones de tus sensores de agua</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 text-sm">Cargando alertas...</p>
            </div>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="plain" onClick={handleBackToDashboard}>
              <PiArrowLeftDuotone className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mis Alertas</h1>
              <p className="text-gray-600 mt-1">Notificaciones de tus sensores de agua</p>
            </div>
          </div>
        </div>

        {/* Resumen de Alertas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total de Alertas</p>
                <p className="text-3xl font-bold text-blue-600">{alerts.length}</p>
              </div>
              <PiBellDuotone className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pendientes</p>
                <p className="text-3xl font-bold text-orange-600">{unresolvedAlerts.length}</p>
              </div>
              <PiWarningDuotone className="w-8 h-8 text-orange-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Resueltas</p>
                <p className="text-3xl font-bold text-green-600">{resolvedAlerts.length}</p>
              </div>
              <PiCheckCircleDuotone className="w-8 h-8 text-green-600" />
            </div>
          </Card>
        </div>

        {/* Alertas Pendientes */}
        {unresolvedAlerts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Alertas Pendientes</h2>
            <div className="space-y-3">
              {unresolvedAlerts.map((alert) => (
                <Card key={alert._id} className="p-4 border-l-4 border-orange-500">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getAlertTypeIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${getAlertTypeColor(alert.type)}`}>
                            {getAlertTypeText(alert.type)}
                          </span>
                        </div>
                        <p className="text-gray-900 font-medium">{alert.message}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                          <PiCalendarDuotone className="w-4 h-4 mr-1" />
                          <span>
                            {format(new Date(alert.triggeredAt), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="solid"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleMarkAsResolved(alert._id)}
                    >
                      Marcar como Resuelto
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Alertas Resueltas */}
        {resolvedAlerts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Alertas Resueltas</h2>
            <div className="space-y-3">
              {resolvedAlerts.slice(0, 5).map((alert) => (
                <Card key={alert._id} className="p-4 border-l-4 border-green-500 bg-green-50">
                  <div className="flex items-start space-x-3">
                    <PiCheckCircleDuotone className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium">
                          {getAlertTypeText(alert.type)}
                        </span>
                        <span className="px-2 py-1 bg-green-200 text-green-800 rounded-md text-xs font-medium">
                          Resuelto
                        </span>
                      </div>
                      <p className="text-gray-700">{alert.message}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <PiCalendarDuotone className="w-4 h-4 mr-1" />
                        <span>
                          {format(new Date(alert.triggeredAt), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {resolvedAlerts.length > 5 && (
                <p className="text-center text-gray-500 text-sm">
                  Y {resolvedAlerts.length - 5} alertas resueltas más...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Sin Alertas */}
        {alerts.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <PiCheckCircleDuotone className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Todo está en orden!</h3>
              <p className="text-gray-600">No tienes alertas en este momento. Tus sensores están funcionando correctamente.</p>
            </div>
          </Card>
        )}
      </div>
    </Container>
  )
}

export default UserAlertsPage