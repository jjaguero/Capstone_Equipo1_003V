import { Card } from '@/components/ui'
import {
  PiDropDuotone,
  PiChartLineUpDuotone,
  PiTargetDuotone,
  PiTrendUpDuotone,
  PiTrendDownDuotone,
} from 'react-icons/pi'
import { ConsumptionMetrics } from '../utils/consumption.utils'

interface ConsumptionKPICardsProps {
  metrics: ConsumptionMetrics
}

export const ConsumptionKPICards = ({ metrics }: ConsumptionKPICardsProps) => {
  const changeNum = parseFloat(metrics.changePercent)
  const isPositiveChange = changeNum > 0

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Consumo Total
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
              {metrics.totalConsumption} L
            </p>
          </div>
          <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
            <PiDropDuotone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </Card>

      <Card className="border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Promedio Diario
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
              {metrics.avgDaily} L
            </p>
          </div>
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
            <PiChartLineUpDuotone className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </Card>

      <Card className="border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cambio</p>
            <div className="mt-1 flex items-center gap-1">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {metrics.changePercent}%
              </p>
              {isPositiveChange ? (
                <PiTrendUpDuotone className="h-5 w-5 text-red-500" />
              ) : (
                <PiTrendDownDuotone className="h-5 w-5 text-green-500" />
              )}
            </div>
          </div>
          <div
            className={`rounded-full p-3 ${
              isPositiveChange
                ? 'bg-red-100 dark:bg-red-900'
                : 'bg-green-100 dark:bg-green-900'
            }`}
          >
            <PiTargetDuotone
              className={`h-6 w-6 ${
                isPositiveChange
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              }`}
            />
          </div>
        </div>
      </Card>

      <Card className="border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sensores Activos
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
              {metrics.activeSensors}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {metrics.avgTimeOnSystem}
            </p>
          </div>
          <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
            <PiDropDuotone className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </Card>
    </div>
  )
}
