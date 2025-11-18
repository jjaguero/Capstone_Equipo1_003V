import { Card } from '@/components/ui'
import { PiDropDuotone } from 'react-icons/pi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Measurement {
  _id: string
  sensorId: string
  liters: number
  durationSec: number
  startTime: string
  endTime: string
}

interface RecentMeasurementsProps {
  measurements: Measurement[]
}

const RecentMeasurements = ({ measurements }: RecentMeasurementsProps) => {
  if (measurements.length === 0) {
    return (
      <Card>
        <div className="p-6 text-center text-gray-500">
          <PiDropDuotone className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No hay mediciones recientes</p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Mediciones Recientes
        </h3>
        
        <div className="space-y-3">
          {measurements.map((measurement) => {
            const flowRate = measurement.durationSec > 0 
              ? (measurement.liters / measurement.durationSec) * 60 
              : 0

            return (
              <div 
                key={measurement._id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {measurement.liters.toFixed(1)}L
                    </p>
                    <p className="text-xs text-gray-500">
                      {flowRate.toFixed(1)} L/min
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {format(new Date(measurement.startTime), 'HH:mm:ss')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.floor(measurement.durationSec / 60)}m {measurement.durationSec % 60}s
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

export default RecentMeasurements
