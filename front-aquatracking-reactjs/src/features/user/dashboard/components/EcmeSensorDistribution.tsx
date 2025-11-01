import { Card, Badge, Progress } from '@/components/ui'
import { Sensor } from '@/@types/entities/sensor.type'
import { PiDropDuotone, PiWifiXDuotone, PiWarningCircleDuotone } from 'react-icons/pi'
import { normalizeSensorName } from '@/utils/sensor-name.utils'

interface EcmeSensorDistributionProps {
  sensors: Sensor[]
  loading?: boolean
}

const EcmeSensorDistribution = ({ sensors, loading }: EcmeSensorDistributionProps) => {
  if (loading) {
    return (
      <Card className="h-full">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    )
  }

  // Calcular estadísticas de sensores
  const activeSensors = sensors.filter(s => s.status === 'active')
  const inactiveSensors = sensors.filter(s => s.status === 'inactive')
  const maintenanceSensors = sensors.filter(s => s.status === 'maintenance')
  const totalSensors = sensors.length

  // Calcular porcentajes
  const activePercentage = totalSensors > 0 ? (activeSensors.length / totalSensors) * 100 : 0
  const inactivePercentage = totalSensors > 0 ? (inactiveSensors.length / totalSensors) * 100 : 0
  const maintenancePercentage = totalSensors > 0 ? (maintenanceSensors.length / totalSensors) * 100 : 0

  // Determinar estado general del sistema
  const getSystemStatus = () => {
    if (activePercentage >= 80) return { status: 'Excelente', color: 'bg-green-500', textColor: 'text-green-600' }
    if (activePercentage >= 60) return { status: 'Bueno', color: 'bg-blue-500', textColor: 'text-blue-600' }
    if (activePercentage >= 40) return { status: 'Regular', color: 'bg-yellow-500', textColor: 'text-yellow-600' }
    return { status: 'Crítico', color: 'bg-red-500', textColor: 'text-red-600' }
  }

  const systemStatus = getSystemStatus()

  if (totalSensors === 0) {
    return (
      <Card
        header={{ content: 'Distribución de Sensores' }}
        className="h-full"
      >
        <div className="flex flex-col items-center justify-center h-32 text-gray-500">
          <PiDropDuotone className="text-4xl mb-2 opacity-50" />
          <p className="text-sm">No hay sensores configurados</p>
        </div>
      </Card>
    )
  }

  return (
    <Card
      header={{ 
        content: (
          <div className="flex items-center justify-between w-full">
            <span>Distribución de Sensores</span>
            <Badge 
              className={`${systemStatus.color} text-white px-3 py-1 text-xs font-medium`}
              content={systemStatus.status}
            />
          </div>
        )
      }}
      className="h-full bg-gradient-to-br from-white to-blue-50 border-l-4 border-blue-500"
    >
      <div className="space-y-6">
        {/* Resumen General */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-xl shadow-sm border">
            <div className="text-2xl font-bold text-gray-800">{totalSensors}</div>
            <div className="text-sm text-gray-600">Total Sensores</div>
          </div>
          <div className="text-center p-4 bg-white rounded-xl shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{activeSensors.length}</div>
            <div className="text-sm text-gray-600">Activos</div>
          </div>
          <div className="text-center p-4 bg-white rounded-xl shadow-sm border">
            <div className={`text-2xl font-bold ${systemStatus.textColor}`}>
              {activePercentage.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Disponibilidad</div>
          </div>
        </div>

        {/* Estado detallado de sensores */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700 flex items-center">
            <PiWifiXDuotone className="mr-2 text-blue-500" />
            Estado de Sensores
          </h4>

          {/* Sensores Activos */}
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-700">Activos</span>
              </div>
              <Badge 
                className="bg-green-100 text-green-800"
                content={activeSensors.length}
              />
            </div>
            <Progress 
              percent={activePercentage} 
              customColorClass="text-green-500"
              className="mb-2"
            />
            <div className="text-xs text-gray-500">
              {activePercentage.toFixed(1)}% del total
            </div>
          </div>

          {/* Sensores Inactivos */}
          {inactiveSensors.length > 0 && (
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-700">Inactivos</span>
                </div>
                <Badge 
                  className="bg-gray-100 text-gray-800"
                  content={inactiveSensors.length}
                />
              </div>
              <Progress 
                percent={inactivePercentage} 
                customColorClass="text-gray-400"
                className="mb-2"
              />
              <div className="text-xs text-gray-500">
                {inactivePercentage.toFixed(1)}% del total
              </div>
            </div>
          )}

          {/* Sensores en Mantenimiento */}
          {maintenanceSensors.length > 0 && (
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-700">Mantenimiento</span>
                </div>
                <Badge 
                  className="bg-yellow-100 text-yellow-800"
                  content={maintenanceSensors.length}
                />
              </div>
              <Progress 
                percent={maintenancePercentage} 
                customColorClass="text-yellow-500"
                className="mb-2"
              />
              <div className="text-xs text-gray-500">
                {maintenancePercentage.toFixed(1)}% del total
              </div>
            </div>
          )}
        </div>

        {/* Lista de sensores individuales */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-700 flex items-center">
            <PiDropDuotone className="mr-2 text-blue-500" />
            Sensores Individuales
          </h4>
          <div className="max-h-32 overflow-y-auto space-y-2">
            {sensors.map((sensor) => (
              <div 
                key={sensor._id} 
                className="flex items-center justify-between p-2 bg-white rounded border text-sm"
              >
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    sensor.status === 'active' ? 'bg-green-500' :
                    sensor.status === 'maintenance' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="font-medium truncate max-w-[120px]">
                    {sensor.serialNumber} - {normalizeSensorName(sensor.category || sensor.subType || 'Sensor')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">{normalizeSensorName(sensor.location || 'Sin ubicación')}</span>
                  <Badge 
                    className={`text-xs ${
                      sensor.status === 'active' ? 'bg-green-100 text-green-800' :
                      sensor.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                    content={sensor.status}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerta si hay problemas */}
        {activePercentage < 50 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <PiWarningCircleDuotone className="text-red-500 mr-2" />
              <span className="text-sm text-red-700 font-medium">
                Atención: Baja disponibilidad de sensores
              </span>
            </div>
            <p className="text-xs text-red-600 mt-1 ml-6">
              Se recomienda revisar los sensores inactivos para mantener un monitoreo óptimo.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

export default EcmeSensorDistribution