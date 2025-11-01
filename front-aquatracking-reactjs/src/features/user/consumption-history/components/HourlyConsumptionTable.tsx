import { Card } from '@/components/ui'
import { PiClockDuotone } from 'react-icons/pi'
import { HourlyConsumptionData } from '../hooks'

interface HourlyConsumptionTableProps {
  hourlyConsumption: HourlyConsumptionData[]
  loading: boolean
  error: string | null
}

export const HourlyConsumptionTable = ({
  hourlyConsumption,
  loading,
  error,
}: HourlyConsumptionTableProps) => {
  if (!hourlyConsumption.length && !loading && !error) {
    return null
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <PiClockDuotone className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Consumo por Hora (Hoy)
        </h3>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && hourlyConsumption.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Consumo (L)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  % del Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {hourlyConsumption.map((item) => {
                const total = hourlyConsumption.reduce(
                  (sum, h) => sum + h.consumption,
                  0
                )
                const percentage = total > 0 ? (item.consumption / total) * 100 : 0

                return (
                  <tr
                    key={item.hour}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {String(item.hour).padStart(2, '0')}:00 -{' '}
                      {String(item.hour).padStart(2, '0')}:59
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {item.consumption.toFixed(2)} L
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-full bg-indigo-600 transition-all dark:bg-indigo-400"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && hourlyConsumption.length === 0 && (
        <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          No hay datos de consumo por hora para mostrar
        </div>
      )}
    </Card>
  )
}
