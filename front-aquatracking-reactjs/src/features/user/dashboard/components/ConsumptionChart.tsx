import React from 'react'
import { Card } from '@/components/ui'
import { DailyConsumption } from '@/@types/entities'

interface ConsumptionChartProps {
  consumptions: DailyConsumption[]
  loading: boolean
}

const ConsumptionChart: React.FC<ConsumptionChartProps> = ({ consumptions, loading }) => {
  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <div className="p-6">
          <h5 className="text-lg font-semibold text-gray-900 mb-4">Consumo de los Últimos 7 Días</h5>
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 text-sm">Cargando datos...</p>
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
          <h5 className="text-lg font-semibold text-gray-900 mb-4">Consumo de los Últimos 7 Días</h5>
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500">No hay datos de consumo disponibles</p>
              <p className="text-sm text-gray-400 mt-1">Los datos aparecerán aquí una vez que haya registros</p>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Tomar los últimos 7 días y ordenar por fecha
  const last7Days = consumptions
    .slice(0, 7)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const maxValue = Math.max(...last7Days.map(c => c.totalLiters))
  const avgValue = last7Days.reduce((sum, c) => sum + c.totalLiters, 0) / last7Days.length

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h5 className="text-lg font-semibold text-gray-900">Consumo de los Últimos 7 Días</h5>
          <div className="text-right">
            <div className="text-sm text-gray-500">Promedio</div>
            <div className="text-lg font-semibold text-blue-600">{avgValue.toFixed(1)} L</div>
          </div>
        </div>

        {/* Gráfico de barras simple */}
        <div className="space-y-3">
          {last7Days.map((consumption, index) => {
            const percentage = maxValue > 0 ? (consumption.totalLiters / maxValue) * 100 : 0
            const date = new Date(consumption.date)
            const isToday = date.toDateString() === new Date().toDateString()
            
            return (
              <div key={consumption._id} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className={`font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                    {date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                    {isToday && ' (Hoy)'}
                  </span>
                  <span className={`font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                    {consumption.totalLiters.toFixed(1)} L
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isToday ? 'bg-blue-500' : 'bg-blue-400'
                    }`}
                    style={{ 
                      width: `${percentage}%`,
                      animationDelay: `${index * 100}ms`
                    }}
                  />
                </div>
                {consumption.limitLiters && consumption.totalLiters > consumption.limitLiters && (
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Límite excedido ({consumption.limitLiters}L)</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Indicadores adicionales */}
        <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Consumo Máximo</div>
            <div className="text-lg font-semibold text-gray-900">{maxValue.toFixed(1)} L</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Total Semana</div>
            <div className="text-lg font-semibold text-gray-900">
              {last7Days.reduce((sum, c) => sum + c.totalLiters, 0).toFixed(1)} L
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ConsumptionChart