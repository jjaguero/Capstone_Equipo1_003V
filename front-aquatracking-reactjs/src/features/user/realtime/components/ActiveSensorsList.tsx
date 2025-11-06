import { Card } from '@/components/ui'
import { PiDevicesDuotone, PiDropDuotone } from 'react-icons/pi'
import { Sensor } from '@/@types/entities'
import { normalizeSensorName } from '@/utils/sensor-name.utils'

interface ActiveSensorsListProps {
  sensors: Sensor[]
  loading: boolean
  selectedSensorId?: string | null
  onSensorSelect?: (sensorId: string | null) => void
}

const ActiveSensorsList = ({ sensors, loading, selectedSensorId, onSensorSelect }: ActiveSensorsListProps) => {
  if (loading) {
    return (
      <Card>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2 text-sm">Cargando sensores...</p>
        </div>
      </Card>
    )
  }

  const activeSensors = sensors.filter(s => s.status === 'active')

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <PiDevicesDuotone className="w-5 h-5" />
          Sensores Activos
        </h3>
        
        {activeSensors.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <PiDevicesDuotone className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No hay sensores activos</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activeSensors.map((sensor) => (
              <div 
                key={sensor._id}
                onClick={() => onSensorSelect?.(sensor._id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedSensorId === sensor._id
                    ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-400 dark:border-blue-600 shadow-md'
                    : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium text-sm ${
                    selectedSensorId === sensor._id 
                      ? 'text-blue-900 dark:text-blue-100' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {normalizeSensorName(sensor.subType || sensor.category || 'Sensor')}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      selectedSensorId === sensor._id ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}></div>
                    <span className={`text-xs ${
                      selectedSensorId === sensor._id 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {selectedSensorId === sensor._id ? 'Seleccionado' : 'Activo'}
                    </span>
                  </div>
                </div>
                
                <p className={`text-xs mb-1 ${
                  selectedSensorId === sensor._id 
                    ? 'text-blue-700 dark:text-blue-300' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {normalizeSensorName(sensor.location || 'Sin ubicación')}
                </p>
                
                <p className={`text-xs font-mono ${
                  selectedSensorId === sensor._id 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-500'
                }`}>
                  {sensor.serialNumber}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

export default ActiveSensorsList
