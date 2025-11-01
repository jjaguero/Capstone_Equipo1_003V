import React from 'react'
import { Card } from '@/components/ui'
import { Timeline } from '@/components/ui/Timeline'
import { Progress } from '@/components/ui/Progress'
import { DailyConsumption } from '@/@types/entities'
import { PiDropDuotone, PiWarningCircleDuotone, PiCheckCircleDuotone, PiTrendUpDuotone } from 'react-icons/pi'

interface EcmeConsumptionTimelineProps {
  consumptions: DailyConsumption[]
  loading: boolean
  userLimit: number
}

const EcmeConsumptionTimeline: React.FC<EcmeConsumptionTimelineProps> = ({ 
  consumptions, 
  loading, 
  userLimit 
}) => {
  if (loading) {
    return (
      <Card className="bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <PiDropDuotone className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h5 className="text-lg font-semibold text-gray-900">Análisis de Consumo Semanal</h5>
              <p className="text-sm text-gray-500">Patrón de uso de agua en los últimos 7 días</p>
            </div>
          </div>
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 text-sm">Analizando patrones de consumo...</p>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (consumptions.length === 0) {
    return (
      <Card className="bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <PiDropDuotone className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h5 className="text-lg font-semibold text-gray-900">Análisis de Consumo Semanal</h5>
              <p className="text-sm text-gray-500">Patrón de uso de agua en los últimos 7 días</p>
            </div>
          </div>
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <PiDropDuotone className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-gray-500 font-medium">Preparando análisis</p>
              <p className="text-sm text-gray-400 mt-1">Los datos aparecerán aquí una vez que haya registros</p>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Preparar datos para los últimos 7 días
  const last7Days = consumptions
    .slice(0, 7)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const avgValue = last7Days.reduce((sum, c) => sum + c.totalLiters, 0) / last7Days.length
  const totalWeek = last7Days.reduce((sum, c) => sum + c.totalLiters, 0)
  const maxDay = Math.max(...last7Days.map(c => c.totalLiters))

  // Función para obtener el color del día según el consumo
  const getDayColor = (consumption: number) => {
    const percentage = (consumption / userLimit) * 100
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-amber-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-emerald-600'
  }

  const getDayIcon = (consumption: number) => {
    const percentage = (consumption / userLimit) * 100
    if (percentage >= 90) return <PiWarningCircleDuotone className="w-6 h-6 text-red-500" />
    if (percentage >= 75) return <PiWarningCircleDuotone className="w-6 h-6 text-amber-500" />
    return <PiCheckCircleDuotone className="w-6 h-6 text-emerald-500" />
  }

  const getProgressColor = (consumption: number) => {
    const percentage = (consumption / userLimit) * 100
    if (percentage >= 90) return 'text-red-500'
    if (percentage >= 75) return 'text-amber-500'
    if (percentage >= 50) return 'text-yellow-500'
    return 'text-emerald-500'
  }

  return (
    <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <PiDropDuotone className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h5 className="text-lg font-semibold text-gray-900">Análisis de Consumo Semanal</h5>
              <p className="text-sm text-gray-500">Patrón de uso de agua en los últimos 7 días</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <PiTrendUpDuotone className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Promedio</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{avgValue.toFixed(1)} L</div>
            <div className="text-xs text-gray-400">/ {userLimit}L límite</div>
          </div>
        </div>

        {/* Timeline de consumos */}
        <div className="mb-6">
          <Timeline>
            {last7Days.map((consumption, index) => {
              const date = new Date(consumption.date)
              const isToday = date.toDateString() === new Date().toDateString()
              const percentage = (consumption.totalLiters / userLimit) * 100
              
              return (
                <Timeline.Item
                  key={consumption._id}
                  media={getDayIcon(consumption.totalLiters)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h6 className={`font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                        {date.toLocaleDateString('es-ES', { weekday: 'long' })}
                        {isToday && ' (Hoy)'}
                      </h6>
                      <p className="text-sm text-gray-500">
                        {date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-xl font-bold ${getDayColor(consumption.totalLiters)}`}>
                        {consumption.totalLiters.toFixed(1)} L
                      </div>
                      <div className="text-xs text-gray-500">
                        {percentage.toFixed(0)}% del límite
                      </div>
                    </div>
                  </div>

                  {/* Progress bar usando componente Ecme */}
                  <div className="mb-3">
                    <Progress
                      percent={Math.min(percentage, 100)}
                      customColorClass={getProgressColor(consumption.totalLiters)}
                      showInfo={false}
                      size="sm"
                    />
                  </div>

                  {/* Distribución por sensores si está disponible */}
                  {consumption.bySensor && consumption.bySensor.length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs font-medium text-gray-700 mb-2">Distribución por sensor:</div>
                      <div className="flex flex-wrap gap-2">
                        {consumption.bySensor.map((sensor, idx) => (
                          <div key={idx} className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-gray-200">
                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                            <span className="text-xs text-gray-600 font-medium">{sensor.liters.toFixed(1)}L</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Alerta si excede límite */}
                  {consumption.totalLiters > userLimit && (
                    <div className="mt-3 flex items-center gap-2 text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                      <PiWarningCircleDuotone className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Límite excedido por {(consumption.totalLiters - userLimit).toFixed(1)}L
                      </span>
                    </div>
                  )}
                </Timeline.Item>
              )
            })}
          </Timeline>
        </div>

        {/* Estadísticas de resumen con diseño Ecme */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600 mb-1">{totalWeek.toFixed(1)}L</div>
            <div className="text-xs font-medium text-blue-700 uppercase tracking-wide">Total Semana</div>
          </div>
          
          <div className="text-center p-4 bg-emerald-50 rounded-xl">
            <div className="text-2xl font-bold text-emerald-600 mb-1">{maxDay.toFixed(1)}L</div>
            <div className="text-xs font-medium text-emerald-700 uppercase tracking-wide">Día Máximo</div>
          </div>
          
          <div className="text-center p-4 bg-amber-50 rounded-xl">
            <div className={`text-2xl font-bold mb-1 ${
              avgValue <= userLimit * 0.8 ? 'text-emerald-600' : 
              avgValue <= userLimit ? 'text-amber-600' : 'text-red-600'
            }`}>
              {avgValue <= userLimit * 0.8 ? 'A+' : avgValue <= userLimit ? 'B' : 'C'}
            </div>
            <div className="text-xs font-medium text-gray-700 uppercase tracking-wide">Eficiencia</div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default EcmeConsumptionTimeline