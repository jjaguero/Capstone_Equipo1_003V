import { Card } from '@/components/ui'
import { PiDevicesDuotone, PiDropDuotone } from 'react-icons/pi'
import { Sensor } from '@/@types/entities'

interface ActiveSensorsListProps {
  sensors: Sensor[]
  loading: boolean
}

const ActiveSensorsList = ({ sensors, loading }: ActiveSensorsListProps) => {
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
                className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {sensor.subType || 'Sensor'}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">Activo</span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {sensor.location}
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
