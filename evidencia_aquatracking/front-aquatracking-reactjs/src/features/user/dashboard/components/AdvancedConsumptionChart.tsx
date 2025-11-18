import React from 'react'
import { Card } from '@/components/ui'
import { DailyConsumption } from '@/@types/entities'

interface AdvancedConsumptionChartProps {
  consumptions: DailyConsumption[]
  loading: boolean
  userLimit: number
}

const AdvancedConsumptionChart: React.FC<AdvancedConsumptionChartProps> = ({ 
  consumptions, 
  loading, 
  userLimit 
}) => {
  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <div className="p-6">
          <h5 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Consumo Semanal</h5>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 text-sm">Analizando patrones de consumo...</p>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (consumptions.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <div className="p-6">
          <h5 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Consumo Semanal</h5>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Preparando análisis</p>
              <p className="text-sm text-gray-400 mt-1">Los datos aparecerán aquí una vez que haya registros de consumo</p>
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

  const maxValue = Math.max(...last7Days.map(c => c.totalLiters), userLimit)
  const avgValue = last7Days.reduce((sum, c) => sum + c.totalLiters, 0) / last7Days.length

  // Colores para diferentes niveles de consumo
  const getConsumptionColor = (consumption: number, limit: number) => {
    const percentage = (consumption / limit) * 100
    if (percentage >= 90) return 'from-red-400 to-red-600'
    if (percentage >= 75) return 'from-amber-400 to-orange-600'
    if (percentage >= 50) return 'from-yellow-400 to-amber-500'
    return 'from-emerald-400 to-green-600'
  }

  const getConsumptionBg = (consumption: number, limit: number) => {
    const percentage = (consumption / limit) * 100
    if (percentage >= 90) return 'bg-red-50 border-red-200'
    if (percentage >= 75) return 'bg-amber-50 border-amber-200'
    if (percentage >= 50) return 'bg-yellow-50 border-yellow-200'
    return 'bg-emerald-50 border-emerald-200'
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h5 className="text-lg font-semibold text-gray-900">Análisis de Consumo Semanal</h5>
            <p className="text-sm text-gray-500 mt-1">Patrón de uso de agua en los últimos 7 días</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Promedio</div>
            <div className="text-xl font-bold text-indigo-600">{avgValue.toFixed(1)} L</div>
            <div className="text-xs text-gray-400">/ {userLimit}L límite</div>
          </div>
        </div>

        {/* Timeline Chart */}
        <div className="space-y-4 mb-6">
          {last7Days.map((consumption, index) => {
            const percentage = (consumption.totalLiters / maxValue) * 100
            const date = new Date(consumption.date)
            const isToday = date.toDateString() === new Date().toDateString()
            const isWeekend = date.getDay() === 0 || date.getDay() === 6
            
            return (
              <div key={consumption._id} className={`p-4 rounded-lg border transition-all duration-300 hover:shadow-md ${getConsumptionBg(consumption.totalLiters, userLimit)}`}>
                {/* Día y fecha */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isToday ? 'bg-indigo-500' : isWeekend ? 'bg-amber-400' : 'bg-gray-400'}`} />
                    <div>
                      <span className={`font-semibold ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>
                        {date.toLocaleDateString('es-ES', { weekday: 'long' })}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        {date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        {isToday && ' (Hoy)'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${isToday ? 'text-indigo-600' : 'text-gray-900'}`}>
                      {consumption.totalLiters.toFixed(1)} L
                    </div>
                    <div className="text-xs text-gray-500">
                      {((consumption.totalLiters / userLimit) * 100).toFixed(0)}% del límite
                    </div>
                  </div>
                </div>

                {/* Barra de progreso principal */}
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${getConsumptionColor(consumption.totalLiters, userLimit)} transition-all duration-700 shadow-sm`}
                      style={{ 
                        width: `${Math.min(percentage, 100)}%`,
                        animationDelay: `${index * 150}ms`
                      }}
                    />
                  </div>
                  
                  {/* Línea del límite */}
                  {userLimit <= maxValue && (
                    <div 
                      className="absolute top-0 h-4 w-0.5 bg-red-500 rounded-full"
                      style={{ left: `${(userLimit / maxValue) * 100}%` }}
                    />
                  )}
                </div>

                {/* Breakdown por sensor si está disponible */}
                {consumption.bySensor && consumption.bySensor.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-600 mb-2">Distribución por sensor:</div>
                    <div className="flex flex-wrap gap-2">
                      {consumption.bySensor.map((sensor, idx) => (
                        <div key={idx} className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border">
                          <div className="w-2 h-2 rounded-full bg-blue-400" />
                          <span className="text-xs text-gray-600">{sensor.liters.toFixed(1)}L</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Alerta si excede límite */}
                {consumption.totalLiters > userLimit && (
                  <div className="mt-3 flex items-center gap-2 text-red-700 bg-red-100 px-3 py-2 rounded-lg">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">
                      Límite excedido por {(consumption.totalLiters - userLimit).toFixed(1)}L
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Estadísticas adicionales */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Total Semana</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">
              {last7Days.reduce((sum, c) => sum + c.totalLiters, 0).toFixed(1)} L
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Día Máximo</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">
              {Math.max(...last7Days.map(c => c.totalLiters)).toFixed(1)} L
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Eficiencia</div>
            <div className={`text-lg font-semibold mt-1 ${avgValue <= userLimit * 0.8 ? 'text-emerald-600' : avgValue <= userLimit ? 'text-amber-600' : 'text-red-600'}`}>
              {avgValue <= userLimit * 0.8 ? 'Excelente' : avgValue <= userLimit ? 'Buena' : 'Mejorable'}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default AdvancedConsumptionChart