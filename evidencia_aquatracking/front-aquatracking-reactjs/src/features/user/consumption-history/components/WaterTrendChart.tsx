import React from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { PiWavesDuotone } from 'react-icons/pi'
import type { DailyConsumption } from '@/@types/entities'

interface WaterTrendChartProps {
  data: DailyConsumption[]
  chartType: 'line' | 'bar' | 'area'
  onChartTypeChange: (type: 'line' | 'bar' | 'area') => void
}

const WaterTrendChart: React.FC<WaterTrendChartProps> = ({
  data,
  chartType,
  onChartTypeChange
}) => {
  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-dashed border-blue-200">
        <div className="text-center">
          <PiWavesDuotone className="w-16 h-16 mx-auto mb-4 text-blue-300" />
          <p className="text-blue-600 font-medium">No hay datos para mostrar</p>
          <p className="text-blue-500 text-sm">Selecciona un período diferente</p>
        </div>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.totalLiters))
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <PiWavesDuotone className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">Tendencia de Consumo de Agua</h3>
        </div>
        <div className="flex space-x-2">
          {(['line', 'bar', 'area'] as const).map((type) => (
            <button
              key={type}
              onClick={() => onChartTypeChange(type)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                chartType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              {type === 'line' ? 'Línea' : type === 'bar' ? 'Barras' : 'Área'}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-64 flex items-end justify-between space-x-1 bg-gray-50 rounded-lg p-4">
        {data.map((consumption, index) => {
          const height = maxValue > 0 ? (consumption.totalLiters / maxValue) * 200 : 0
          
          return (
            <div key={consumption.date} className="flex flex-col items-center flex-1">
              <div className="text-xs text-gray-600 mb-1 font-medium">
                {consumption.totalLiters.toFixed(1)}L
              </div>
              <div 
                className="bg-blue-500 rounded-t w-full transition-all duration-500 hover:bg-blue-600"
                style={{ height: `${height}px`, minHeight: '4px' }}
                title={`${format(new Date(consumption.date), 'd MMM', { locale: es })}: ${consumption.totalLiters.toFixed(1)}L`}
              />
              <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-bottom-left">
                {format(new Date(consumption.date), 'd MMM', { locale: es })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default WaterTrendChart