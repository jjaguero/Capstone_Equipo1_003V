import { Card, Badge, Button } from '@/components/ui'
import Container from '@/components/shared/Container'
import { useSensors } from '../hooks/useSensors'
import { useAquaTrackingAuth } from '@/features/auth/hooks/useAquaTrackingAuth'
import { normalizeSensorName } from '@/utils/sensor-name.utils'
import { 
  PiDevicesDuotone, 
  PiGearDuotone,
  PiWifiXDuotone,
  PiCheckCircleDuotone,
  PiWarningCircleDuotone,
  PiMapPinDuotone,
  PiArrowLeftDuotone,
  PiEyeDuotone
} from 'react-icons/pi'

const SensorsPage = () => {
  const { currentUser } = useAquaTrackingAuth()
  const { sensors, loading } = useSensors(currentUser?.homeId)

  const handleBackToDashboard = () => {
    window.location.href = '/user/overview'
  }

  const handleSensorDetails = (sensor: any) => {
    window.location.href = `/user/sensors/${sensor._id}`;
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

  const activeSensors = sensors.filter(s => s.status === 'active')
  const inactiveSensors = sensors.filter(s => s.status === 'inactive')
  const maintenanceSensors = sensors.filter(s => s.status === 'maintenance')



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'maintenance': return 'bg-orange-100 text-orange-800'
      case 'absent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <PiCheckCircleDuotone className="w-5 h-5 text-green-600" />
      case 'inactive': return <PiWifiXDuotone className="w-5 h-5 text-gray-600" />
      case 'maintenance': return <PiGearDuotone className="w-5 h-5 text-yellow-600" />
      case 'absent': return <PiWarningCircleDuotone className="w-5 h-5 text-red-600" />
      default: return <PiDevicesDuotone className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <Container>
      <div className="space-y-6">
        {/* Header - Vista de Usuario */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Button 
              size="sm" 
              variant="plain" 
              onClick={handleBackToDashboard}
              className="text-gray-600 hover:text-gray-800"
            >
              <PiArrowLeftDuotone className="w-4 h-4 mr-1" />
              Volver al Dashboard
            </Button>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <PiDevicesDuotone className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mis Sensores</h1>
              <p className="text-gray-600">Monitoreo de sensores de agua en tu hogar</p>
            </div>
          </div>
        </div>

        {/* KPIs Simples como en tu imagen */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-6 bg-white border border-gray-200 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">{activeSensors.length}</div>
            <div className="text-sm text-gray-600 uppercase tracking-wide">ACTIVOS</div>
          </Card>

          <Card className="p-6 bg-white border border-gray-200 text-center">
            <div className="text-3xl font-bold text-gray-600 mb-1">{inactiveSensors.length}</div>
            <div className="text-sm text-gray-600 uppercase tracking-wide">INACTIVOS</div>
          </Card>

          <Card className="p-6 bg-white border border-gray-200 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-1">{maintenanceSensors.length}</div>
            <div className="text-sm text-gray-600 uppercase tracking-wide">MANTENIMIENTO</div>
          </Card>
        </div>

        {/* Lista de Sensores como en tu imagen */}
        <div className="space-y-3">
          {loading ? (
            <Card className="p-6 bg-white border border-gray-200">
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </Card>
          ) : sensors.length === 0 ? (
            <Card className="p-6 bg-white border border-gray-200">
              <div className="text-center py-8">
                <PiDevicesDuotone className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay sensores instalados</h3>
                <p className="text-gray-600">Contacta al administrador para instalar sensores en tu hogar</p>
              </div>
            </Card>
          ) : (
            sensors.map((sensor) => (
              <Card key={sensor._id} className="p-4 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900 text-lg">
                        {normalizeSensorName(sensor.subType || 'sensor')}
                      </h3>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <PiMapPinDuotone className="w-3 h-3" />
                      <span>{normalizeSensorName(sensor.location || '')}</span>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-1">
                      Serie: {sensor.serialNumber}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-md text-xs font-medium ${getStatusColor(sensor.status)}`}>
                      {sensor.status === 'active' ? 'Activo' : 
                       sensor.status === 'inactive' ? 'Inactivo' :
                       sensor.status === 'maintenance' ? 'Mantenimiento' : sensor.status}
                    </span>
                    
                    <button 
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      onClick={() => handleSensorDetails(sensor)}
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Footer con enlace de gestión */}
        {sensors.length > 0 && (
          <div className="text-center py-4">
            <Button 
              variant="plain" 
              className="text-blue-600 hover:text-blue-700"
              onClick={handleBackToDashboard}
            >
              Ver gestión completa de sensores
            </Button>
          </div>
        )}
      </div>
    </Container>
  )
}

export default SensorsPage