import React from 'react'
import { Card, Button } from '@/components/ui'
import { Sensor } from '@/@types/entities'
import { PiDevicesDuotone, PiWarningDuotone, PiCheckCircleDuotone, PiXCircleDuotone, PiArrowRightDuotone } from 'react-icons/pi'
import { normalizeSensorName } from '@/utils/sensor-name.utils'


interface SensorStatusCardProps {
  sensors: Sensor[]
  loading: boolean
  onSensorClick?: (sensor: Sensor) => void
}

const SensorStatusCard: React.FC<SensorStatusCardProps> = ({ sensors, loading, onSensorClick }) => {
  const handleNavigateToSensors = () => {
    window.location.href = '/user/sensors'
  }

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <div className="p-6">
          <h5 className="text-lg font-semibold text-gray-900 mb-4">Estado de Sensores</h5>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 text-sm">Cargando sensores...</p>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (sensors.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <div className="p-6">
          <h5 className="text-lg font-semibold text-gray-900 mb-4">Estado de Sensores</h5>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <PiDevicesDuotone className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500">No hay sensores instalados</p>
              <p className="text-sm text-gray-400 mt-1">Contacta al administrador para instalar sensores</p>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  const activeSensors = sensors.filter(s => s.status === 'active')
  const inactiveSensors = sensors.filter(s => s.status === 'inactive')
  const maintenanceSensors = sensors.filter(s => s.status === 'maintenance')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <PiCheckCircleDuotone className="w-5 h-5 text-emerald-500" />
      case 'inactive':
        return <PiXCircleDuotone className="w-5 h-5 text-gray-400" />
      case 'maintenance':
        return <PiWarningDuotone className="w-5 h-5 text-yellow-500" />
      default:
        return <PiXCircleDuotone className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo'
      case 'inactive':
        return 'Inactivo'
      case 'maintenance':
        return 'Mantenimiento'
      default:
        return 'Desconocido'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      case 'maintenance':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h5 className="text-lg font-semibold text-gray-900">Estado de Sensores</h5>
          <div className="flex items-center gap-2">
            <PiDevicesDuotone className="w-5 h-5 text-indigo-500" />
            <span className="text-sm text-gray-600">{sensors.length} total</span>
          </div>
        </div>

        {/* Resumen de estados */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{activeSensors.length}</div>
            <div className="text-xs text-green-700 uppercase tracking-wide">Activos</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-600">{inactiveSensors.length}</div>
            <div className="text-xs text-gray-700 uppercase tracking-wide">Inactivos</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-600">{maintenanceSensors.length}</div>
            <div className="text-xs text-orange-700 uppercase tracking-wide">Mantenimiento</div>
          </div>
        </div>

        {/* Lista detallada de sensores */}
        <div className="space-y-3">
          {sensors.map((sensor) => (
            <div 
              key={sensor._id} 
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer group"
              onClick={() => onSensorClick?.(sensor)}
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {normalizeSensorName(sensor.subType || sensor.category || 'Sensor')}
                </div>
                <div className="text-sm text-gray-500 mt-1">{normalizeSensorName(sensor.location || '')}</div>
                <div className="text-xs text-gray-400 mt-1">
                  Serie: {sensor.serialNumber}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-md text-xs font-medium ${getStatusColor(sensor.status)}`}>
                  {getStatusText(sensor.status)}
                </span>
                
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Ver detalles
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer con acción */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Button 
            variant="plain" 
            className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            onClick={handleNavigateToSensors}
          >
            <span className="flex items-center justify-center space-x-2">
              <span>Ver gestión completa de sensores</span>
              <PiArrowRightDuotone className="w-4 h-4" />
            </span>
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default SensorStatusCard