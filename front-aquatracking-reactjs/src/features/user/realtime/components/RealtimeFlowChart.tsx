import { Card } from '@/components/ui'
import { PiChartLineDuotone, PiDropDuotone } from 'react-icons/pi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState } from 'react'
import { Sensor } from '@/@types/entities'
import { normalizeSensorName } from '@/utils/sensor-name.utils'

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
  selectedSensorId?: string | null
  onSensorSelect?: (sensorId: string | null) => void
}

const RealtimeFlowChart = ({ measurements, sensors, loading, selectedSensorId: externalSelectedSensorId, onSensorSelect }: RealtimeFlowChartProps) => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: any; sensor?: Sensor } | null>(null)
  const [internalSelectedSensorId, setInternalSelectedSensorId] = useState<string | null>(null)
  
  // Usar el estado externo si está disponible, sino usar el interno
  const selectedSensorId = externalSelectedSensorId !== undefined ? externalSelectedSensorId : internalSelectedSensorId
  
  const handleSensorSelect = (sensorId: string | null) => {
    if (onSensorSelect) {
      onSensorSelect(sensorId)
    } else {
      setInternalSelectedSensorId(sensorId)
    }
  }

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

  // Process measurements into chart data (TODOS los del día)
  const allChartData = measurements
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

  // Filtrar por sensor seleccionado
  const chartData = selectedSensorId 
    ? allChartData.filter(d => d.sensorId === selectedSensorId)
    : allChartData

  if (chartData.length === 0) {
    return (
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <PiChartLineDuotone className="w-5 h-5" />
            Historial de Consumo en Tiempo Real
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
  const padding = { top: 30, right: 30, bottom: 60, left: 60 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const maxLiters = Math.max(...chartData.map(d => d.liters), 1)

  // Escala Y
  const yScale = (value: number) => {
    return padding.top + chartHeight - (value / (maxLiters * 1.1)) * chartHeight
  }

  // Crear puntos para la línea
  const points = chartData.map((d, i) => {
    // Si solo hay 1 punto, centrarlo; si hay varios, distribuirlos
    const x = chartData.length === 1 
      ? padding.left + chartWidth / 2 
      : padding.left + (i / (chartData.length - 1)) * chartWidth
    const y = yScale(d.liters)
    return { x, y, data: d }
  })

  // Crear path para la línea
  const linePath = points.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    return `L ${p.x} ${p.y}`
  }).join(' ')

  // Crear path para el área bajo la línea
  const areaPath = chartData.length === 1
    ? '' // No mostrar área si solo hay 1 punto
    : `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`

  // Obtener lista de sensores únicos que tienen mediciones
  const uniqueSensors = Array.from(new Set(allChartData.map(d => d.sensorId)))
    .map(id => getSensorInfo(id))
    .filter(Boolean) as Sensor[]

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <PiChartLineDuotone className="w-5 h-5" />
          Historial de Consumo en Tiempo Real
        </h3>

        {/* Filtros de sensores */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => handleSensorSelect(null)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedSensorId === null
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos los sensores
          </button>
          {uniqueSensors.map((sensor) => (
            <button
              key={sensor._id}
              onClick={() => handleSensorSelect(sensor._id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedSensorId === sensor._id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {normalizeSensorName(sensor.subType || sensor.category || 'Sensor')}
            </button>
          ))}
        </div>
        
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
                    strokeDasharray="4 4"
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

            {/* Area bajo la línea */}
            {areaPath && (
              <path
                d={areaPath}
                fill="url(#areaGradient)"
                opacity={0.3}
              />
            )}

            {/* Línea principal */}
            {chartData.length > 1 && (
              <path
                d={linePath}
                fill="none"
                stroke="#3b82f6"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Puntos en la línea */}
            {points.map((p, i) => (
              <circle
                key={`point-${i}`}
                cx={p.x}
                cy={p.y}
                r={chartData.length === 1 ? 6 : 4}
                fill="#3b82f6"
                stroke="#fff"
                strokeWidth={2}
                className="cursor-pointer transition-all hover:r-6"
                onMouseEnter={(e) => setTooltip({ 
                  x: e.clientX, 
                  y: e.clientY, 
                  data: p.data,
                  sensor: getSensorInfo(p.data.sensorId)
                })}
                onMouseLeave={() => setTooltip(null)}
              />
            ))}

            {/* Y-axis labels */}
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const value = ((maxLiters * 1.1) / 5) * (5 - i)
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
              if (i % Math.ceil(chartData.length / 8) === 0 || i === chartData.length - 1) {
                const x = points[i].x
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
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
              </linearGradient>
            </defs>
          </svg>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
              <div className="w-4 h-0.5 bg-blue-500"></div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">Litros Consumidos</span>
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-lg p-4 shadow-xl pointer-events-none"
            style={{ left: tooltip.x + 10, top: tooltip.y - 10 }}
          >
            <div className="mb-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Dispositivo</p>
              <p className="font-bold text-gray-900 dark:text-gray-100">
                {normalizeSensorName(tooltip.data.sensorName)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {normalizeSensorName(tooltip.data.location)}
              </p>
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
