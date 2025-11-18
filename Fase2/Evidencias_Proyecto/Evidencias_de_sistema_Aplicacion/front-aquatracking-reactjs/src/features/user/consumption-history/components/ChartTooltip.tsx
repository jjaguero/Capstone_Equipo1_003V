import { createPortal } from 'react-dom'
import { PiDropDuotone, PiTrendUpBold, PiTrendDownBold } from 'react-icons/pi'

interface ChartTooltipProps {
  data: {
    x: number
    y: number
    date: string
    liters: number
    dayOfWeek: string
    percentOfLimit: number
    diffFromAvg: number
  } | null
}

export const ChartTooltip = ({ data }: ChartTooltipProps) => {
  if (!data) return null

  const isOverLimit = data.percentOfLimit > 100
  const isAboveAvg = data.diffFromAvg > 0

  return createPortal(
    <div
      className="pointer-events-none fixed z-50 w-64 rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
      style={{
        left: `${data.x}px`,
        top: `${data.y - 150}px`,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-3 dark:border-gray-700 dark:from-blue-900/20 dark:to-cyan-900/20">
        <div className="text-xs font-medium capitalize text-gray-600 dark:text-gray-400">
          {data.dayOfWeek}
        </div>
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {new Date(data.date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PiDropDuotone className="h-5 w-5 text-blue-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Consumo</span>
          </div>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {data.liters.toFixed(1)} L
          </span>
        </div>

        <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 dark:bg-gray-700/50">
          <span className="text-xs text-gray-600 dark:text-gray-400">% del límite</span>
          <div className="flex items-center gap-1">
            <span
              className={`text-sm font-semibold ${
                isOverLimit
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              }`}
            >
              {data.percentOfLimit.toFixed(1)}%
            </span>
            {isOverLimit && (
              <span className="text-xs text-red-600 dark:text-red-400">⚠️</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-400">vs Promedio</span>
          <div className="flex items-center gap-1">
            {isAboveAvg ? (
              <PiTrendUpBold className="h-4 w-4 text-orange-500" />
            ) : (
              <PiTrendDownBold className="h-4 w-4 text-green-500" />
            )}
            <span
              className={`text-sm font-semibold ${
                isAboveAvg
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-green-600 dark:text-green-400'
              }`}
            >
              {isAboveAvg ? '+' : ''}
              {data.diffFromAvg.toFixed(1)} L
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
