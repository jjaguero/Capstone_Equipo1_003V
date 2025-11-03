import { useEffect, useState } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'

export const RealtimeMeasurementNotification = () => {
  const { newMeasurement } = useWebSocket()
  const [visible, setVisible] = useState(false)
  const [measurement, setMeasurement] = useState<any>(null)

  useEffect(() => {
    if (newMeasurement) {
      setMeasurement(newMeasurement)
      setVisible(true)

      const timer = setTimeout(() => {
        setVisible(false)
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [newMeasurement])

  if (!visible || !measurement) return null

  const isClose = measurement.action === 'close'
  const bgColor = isClose ? 'bg-blue-500' : 'bg-gray-500'
  const icon = isClose ? '💧' : '🚰'

  return (
    <div className="fixed bottom-24 right-4 z-50 animate-in slide-in-from-right">
      <div className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg max-w-sm`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">{icon}</span>
          <div className="flex-1">
            <p className="font-semibold">
              {isClose ? 'Llave cerrada' : 'Llave abierta'}
            </p>
            {isClose && (
              <>
                <p className="text-sm opacity-90 mt-1">
                  {measurement.liters.toFixed(2)} L consumidos
                </p>
                <p className="text-xs opacity-75 mt-0.5">
                  Duración: {Math.floor(measurement.durationSec / 60)}m {measurement.durationSec % 60}s
                </p>
                <p className="text-xs opacity-75">
                  Flujo: {measurement.flowRate.toFixed(2)} L/min
                </p>
              </>
            )}
            {!isClose && (
              <p className="text-sm opacity-90 mt-1">
                Iniciando flujo de agua
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
