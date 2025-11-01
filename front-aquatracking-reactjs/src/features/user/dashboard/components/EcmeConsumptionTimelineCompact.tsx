import { Timeline, Progress, Card } from '@/components/ui'
import { DailyConsumption } from '@/@types/entities/daily-consumption.type'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  PiDropDuotone, 
  PiTrendUpDuotone, 
  PiWarningCircleDuotone,
  PiCheckCircleDuotone 
} from 'react-icons/pi'

interface EcmeConsumptionTimelineCompactProps {
  consumptions: DailyConsumption[]
  loading?: boolean
  userLimit?: number
}

const EcmeConsumptionTimelineCompact = ({ 
  consumptions, 
  loading, 
  userLimit = 500 
}: EcmeConsumptionTimelineCompactProps) => {
  if (loading) {
    return (
      <Card className="h-64">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    )
  }

  if (consumptions.length === 0) {
    return (
      <Card 
        header={{ content: 'Análisis de Consumo Semanal' }}
        className="h-64"
      >
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <PiDropDuotone className="text-4xl mb-2 opacity-50" />
          <p className="text-sm">No hay datos de consumo disponibles</p>
        </div>
      </Card>
    )
  }

  // Procesar últimos 7 días
  const last7Days = consumptions.slice(0, 7)
  const totalWeekly = last7Days.reduce((sum, d) => sum + d.totalLiters, 0)
  const avgDaily = totalWeekly / last7Days.length
  const weeklyLimit = userLimit * 7
  const efficiency = ((weeklyLimit - totalWeekly) / weeklyLimit) * 100

  const getStatusIcon = (liters: number) => {
    const percentage = (liters / userLimit) * 100
    if (percentage > 100) return <PiWarningCircleDuotone className="w-4 h-4 text-red-500" />
    if (percentage > 80) return <PiWarningCircleDuotone className="w-4 h-4 text-yellow-500" />
    return <PiCheckCircleDuotone className="w-4 h-4 text-green-500" />
  }

  const getProgressColor = (liters: number) => {
    const percentage = (liters / userLimit) * 100
    if (percentage > 100) return 'text-red-500'
    if (percentage > 80) return 'text-yellow-500'
    return 'text-green-500'
  }

  return (
    <Card className="bg-white border border-gray-200">
      {/* Header limpio */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Análisis de Consumo Semanal</h3>
        <p className="text-sm text-gray-500">Últimos 7 días de actividad</p>
      </div>

      <div className="p-4">
        {/* KPIs limpios estilo tu ejemplo */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <PiDropDuotone className="w-5 h-5 text-pink-600" />
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">Total semanal</div>
            <div className="text-2xl font-bold text-gray-900">{totalWeekly.toFixed(0)}L</div>
            <div className="text-sm text-green-600 font-medium">
              {efficiency > 0 ? `+${efficiency.toFixed(1)}%` : `${efficiency.toFixed(1)}%`} vs límite
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <PiTrendUpDuotone className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">Promedio diario</div>
            <div className="text-2xl font-bold text-gray-900">{avgDaily.toFixed(0)}L</div>
            <div className="text-sm text-gray-500">
              de {userLimit}L límite
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <PiCheckCircleDuotone className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">Días registrados</div>
            <div className="text-2xl font-bold text-gray-900">{last7Days.length}</div>
            <div className="text-sm text-gray-500">
              de 7 días
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <PiWarningCircleDuotone className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">Estado</div>
            <div className="text-2xl font-bold text-gray-900">
              {efficiency > 0 ? 'Bien' : 'Alto'}
            </div>
            <div className="text-sm text-gray-500">
              consumo
            </div>
          </div>
        </div>

        {/* Lista de días - LO IMPORTANTE como en tu segunda imagen */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Consumo por día</h4>
          
          <div className="space-y-2">
            {last7Days.map((day, index) => {
              const percentage = (day.totalLiters / userLimit) * 100
              const isToday = index === 0
              
              return (
                <div key={day._id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    {/* Indicador de estado */}
                    <div className={`w-2 h-2 rounded-full ${
                      percentage > 100 ? 'bg-red-500' : 
                      percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {format(new Date(day.date), 'EEEE dd/MM', { locale: es })}
                        </span>
                        {isToday && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            Hoy
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {percentage.toFixed(0)}% del límite
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      percentage > 100 ? 'text-red-600' : 
                      percentage > 80 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {day.totalLiters.toFixed(0)}L
                    </div>
                    {percentage > 100 && (
                      <div className="text-xs text-red-500">
                        +{(day.totalLiters - userLimit).toFixed(0)}L exceso
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Alerta simple si es necesario */}
        {efficiency < -10 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <PiWarningCircleDuotone className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700 font-medium">
                Consumo elevado esta semana ({Math.abs(efficiency).toFixed(0)}% sobre límite)
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default EcmeConsumptionTimelineCompact