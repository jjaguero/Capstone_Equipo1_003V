import { useState } from 'react'
import { Card } from '@/components/ui'
import Container from '@/components/shared/Container'
import Breadcrumb from '@/components/shared/Breadcrumb'
import Pagination from '@/components/ui/Pagination'
import { useAlerts } from '@/hooks/useAlerts'
import { useAquaTrackingAuth } from '@/features/auth/hooks/useAquaTrackingAuth'
import { 
  PiWarningDuotone,
  PiCheckCircleDuotone,
  PiXCircleDuotone,
  PiCalendarDuotone,
  PiDropDuotone
} from 'react-icons/pi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const UserAlertsPage = () => {
  const { currentUser } = useAquaTrackingAuth()
  const { alerts, loading } = useAlerts(currentUser?.homeId)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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

  // Filtrar solo alertas activas (no resueltas)
  const activeAlerts = alerts.filter(alert => !alert.resolved)

  // Paginación
  const totalPages = Math.ceil(activeAlerts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedAlerts = activeAlerts.slice(startIndex, endIndex)

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'critical_consumption':
        return <PiWarningDuotone className="w-5 h-5 text-red-600" />
      case 'high_consumption':
        return <PiDropDuotone className="w-5 h-5 text-orange-600" />
      case 'sensor_offline':
        return <PiXCircleDuotone className="w-5 h-5 text-gray-600" />
      default:
        return <PiWarningDuotone className="w-5 h-5 text-blue-600" />
    }
  }

  const getAlertTypeText = (type: string) => {
    switch (type) {
      case 'critical_consumption':
        return 'Consumo Crítico'
      case 'high_consumption':
        return 'Consumo Alto'
      case 'sensor_offline':
        return 'Sensor Inactivo'
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
          <Breadcrumb />
          
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
        <Breadcrumb />

        {/* Contador de alertas */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Alertas</p>
              <p className="text-3xl font-bold text-orange-600">{activeAlerts.length}</p>
            </div>
            <PiWarningDuotone className="w-8 h-8 text-orange-600" />
          </div>
        </Card>

        {/* Lista de Alertas con paginación */}
        {paginatedAlerts.length > 0 ? (
          <div>
            <div className="space-y-3">
              {paginatedAlerts.map((alert) => (
                <Card key={alert._id} className="p-4 border-l-4 border-orange-500 dark:border-orange-600">
                  <div className="flex items-start space-x-3">
                    {getAlertTypeIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getAlertTypeColor(alert.type)}`}>
                          {getAlertTypeText(alert.type)}
                        </span>
                      </div>
                      <p className="text-gray-900 dark:text-gray-100 font-medium">{alert.message}</p>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                        <PiCalendarDuotone className="w-4 h-4 mr-1" />
                        <span>
                          {format(new Date(alert.triggeredAt), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, activeAlerts.length)} de {activeAlerts.length} alertas
                </p>
                <Pagination
                  currentPage={currentPage}
                  total={activeAlerts.length}
                  pageSize={itemsPerPage}
                  onChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        ) : (
          <Card className="p-12">
            <div className="text-center">
              <PiCheckCircleDuotone className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                ¡Todo está en orden!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No tienes alertas activas. Tus sensores están funcionando correctamente y el consumo está dentro de los parámetros normales.
              </p>
            </div>
          </Card>
        )}
      </div>
    </Container>
  )
}

export default UserAlertsPage