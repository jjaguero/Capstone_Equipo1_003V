import { createPortal } from 'react-dom'

interface ChartTooltipProps {
  data: {
    x: number
    y: number
    date: string
    liters: number
  } | null
}

export const ChartTooltip = ({ data }: ChartTooltipProps) => {
  if (!data) return null

  return createPortal(
    <div
      className="pointer-events-none fixed z-50 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800"
      style={{
        left: `${data.x}px`,
        top: `${data.y - 60}px`,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
        {new Date(data.date).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })}
      </div>
      <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
        {data.liters.toFixed(1)} L
      </div>
    </div>,
    document.body
  )
}
