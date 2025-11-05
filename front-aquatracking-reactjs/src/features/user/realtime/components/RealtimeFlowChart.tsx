import { Card } from '@/components/ui'
import { PiChartLineDuotone, PiDropDuotone } from 'react-icons/pi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState } from 'react'
import { Sensor } from '@/@types/entities'

interface Measurement {
  _id: string
  sensorId: string
  homeId: string
  startTime: string
  endTime: string
  liters: number
  durationSec: number
}

interface RealtimeFlowChartProps {
  measurements: Measurement[]
  sensors: Sensor[]
  loading: boolean
}

const RealtimeFlowChart = ({ measurements, sensors, loading }: RealtimeFlowChartProps) => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: any; sensor?: Sensor } | null>(null)

  const getSensorInfo = (sensorId: string) => {
    return sensors.find(s => s._id === sensorId)
  }

  if (loading) {
    return (
      <Card>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2 text-sm">Cargando datos...</p>
        </div>
      </Card>
    )
  }

  // Process measurements into chart data
  const chartData = measurements
    .slice(0, 20)
    .map((measurement) => {
      const flowRate = measurement.durationSec > 0 
        ? (measurement.liters / measurement.durationSec) * 60 
        : 0
      const sensor = getSensorInfo(measurement.sensorId)

      return {
        id: measurement._id,
        sensorId: measurement.sensorId,
        sensorName: sensor?.subType || 'Sensor',
        location: sensor?.location || 'Sin ubicación',
        time: format(new Date(measurement.startTime), 'HH:mm', { locale: es }),
        fullTime: new Date(measurement.startTime),
        flowRate: parseFloat(flowRate.toFixed(2)),
        liters: parseFloat(measurement.liters.toFixed(2)),
      }
    })
    .reverse()

  if (chartData.length === 0) {
    return (
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <PiChartLineDuotone className="w-5 h-5" />
            Flujo en Tiempo Real
          </h3>
          <div className="text-center py-12 text-gray-500">
            <PiChartLineDuotone className="w-16 h-16 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No hay datos de flujo disponibles</p>
          </div>
        </div>
      </Card>
    )
  }

  // Calculate chart dimensions and scales
  const width = 800
  const height = 350
  const padding = { top: 20, right: 30, bottom: 60, left: 60 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const maxLiters = Math.max(...chartData.map(d => d.liters), 1)
  const barWidth = chartWidth / chartData.length - 4

  // Calculate bars for liters
  const bars = chartData.map((d, i) => {
    const x = padding.left + (i * (chartWidth / chartData.length))
    const barHeight = (d.liters / maxLiters) * chartHeight
    const y = padding.top + chartHeight - barHeight
    return { x, y, height: barHeight, width: barWidth, data: d }
  })

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <PiChartLineDuotone className="w-5 h-5" />
          Historial de Consumo en Tiempo Real
        </h3>
        
        <div className="relative overflow-x-auto">
          <svg width={width} height={height} className="text-gray-600 dark:text-gray-400">
            {/* Background grid */}
            <g className="opacity-10">
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const y = padding.top + (i / 5) * chartHeight
                return (
                  <line
                    key={`grid-h-${i}`}
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="currentColor"
                    strokeWidth={1}
                  />
                )
              })}
            </g>

            {/* Y-axis */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={height - padding.bottom}
              stroke="currentColor"
              strokeWidth={2}
            />

            {/* X-axis */}
            <line
              x1={padding.left}
              y1={height - padding.bottom}
              x2={width - padding.right}
              y2={height - padding.bottom}
              stroke="currentColor"
              strokeWidth={2}
            />

            {/* Bars */}
            {bars.map((bar, i) => (
              <g key={`bar-${i}`}>
                <rect
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  fill="url(#gradient)"
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  onMouseEnter={(e) => setTooltip({ 
                    x: e.clientX, 
                    y: e.clientY, 
                    data: bar.data 
                  })}
                  onMouseLeave={() => setTooltip(null)}
                />
                {/* Bar value on top */}
                {bar.data.liters > 0 && (
                  <text
                    x={bar.x + bar.width / 2}
                    y={bar.y - 5}
                    fill="currentColor"
                    fontSize={10}
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {bar.data.liters.toFixed(1)}L
                  </text>
                )}
              </g>
            ))}

            {/* Y-axis labels */}
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const value = (maxLiters / 5) * (5 - i)
              const y = padding.top + (i / 5) * chartHeight
              return (
                <text
                  key={`y-label-${i}`}
                  x={padding.left - 10}
                  y={y + 4}
                  fill="currentColor"
                  fontSize={11}
                  textAnchor="end"
                >
                  {value.toFixed(1)}
                </text>
              )
            })}

            {/* X-axis labels */}
            {chartData.map((d, i) => {
              if (i % Math.ceil(chartData.length / 8) === 0) {
                const x = bars[i].x + bars[i].width / 2
                return (
                  <text
                    key={`label-${i}`}
                    x={x}
                    y={height - padding.bottom + 20}
                    fill="currentColor"
                    fontSize={10}
                    textAnchor="middle"
                  >
                    {d.time}
                  </text>
                )
              }
              return null
            })}

            {/* Y-axis title */}
            <text
              x={20}
              y={height / 2}
              fill="currentColor"
              fontSize={12}
              textAnchor="middle"
              transform={`rotate(-90, 20, ${height / 2})`}
              fontWeight="bold"
            >
              Litros (L)
            </text>

            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-3 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
              <div className="w-3 h-3 bg-gradient-to-b from-blue-500 to-blue-700 rounded-sm"></div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">Litros Consumidos</span>
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-lg p-4 shadow-xl"
            style={{ left: tooltip.x + 10, top: tooltip.y - 10 }}
          >
            <div className="mb-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Dispositivo</p>
              <p className="font-bold text-gray-900 dark:text-gray-100">{tooltip.data.sensorName}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{tooltip.data.location}</p>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">Hora</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{tooltip.data.time}</p>
            </div>
            <div className="pt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Consumo</p>
              <p className="text-lg font-bold text-blue-600">{tooltip.data.liters.toFixed(2)} L</p>
            </div>
            <div className="pt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Velocidad: {tooltip.data.flowRate.toFixed(1)} L/min
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default RealtimeFlowChart
