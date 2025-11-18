import { Card } from '@/components/ui'
import { PiTrendUpDuotone, PiTrendDownDuotone } from 'react-icons/pi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { useTodayConsumption } from '@/hooks/useTodayConsumption'
import { useAquaTrackingAuth } from '@/features/auth/hooks/useAquaTrackingAuth'

interface DailyConsumption {
  date: string
  totalLiters: number
  bySensor: Array<{ sensorId: string; liters: number }>
}

interface DailyConsumptionTableProps {
  consumptions: DailyConsumption[]
  dateFrom: Dayjs | null
  dateTo: Dayjs | null
  selectedSensorId: string | null
}

export const DailyConsumptionTable = ({
  consumptions,
  dateFrom,
  dateTo,
  selectedSensorId,
}: DailyConsumptionTableProps) => {
  const displayData = consumptions.slice(0, 10)
  const { currentUser } = useAquaTrackingAuth()
  const { lastMeasurementTime } = useTodayConsumption(currentUser?.homeId)

  // Obtener la fecha del día más reciente en los datos
  const latestDate = consumptions.length > 0
    ? dayjs([...consumptions].sort((a, b) => 
        dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
      )[0].date).startOf('day')
    : null

  return (
    <Card className="animation-delay-300 transform animate-fade-in-up p-6 transition-all duration-300 hover:shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Datos Detallados por Día
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {selectedSensorId
              ? `Mostrando datos del sensor específico (${consumptions.length} registros)`
              : `Mostrando datos de todos los sensores (${consumptions.length} registros)`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {dateFrom ? dateFrom.format('DD/MM/YYYY') : ''} -{' '}
            {dateTo ? dateTo.format('DD/MM/YYYY') : ''}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                Consumo (L)
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                Sensores Activos
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                Promedio por Sensor
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                Tendencia
              </th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((consumption, index) => {
              const prevConsumption = index > 0 ? displayData[index - 1] : null

              const trend = prevConsumption
                ? consumption.totalLiters > prevConsumption.totalLiters
                  ? 'up'
                  : 'down'
                : 'stable'

              const activeSensorsCount = selectedSensorId
                ? 1
                : consumption.bySensor.filter((bs) => bs.liters > 0).length

              const avgPerSensor =
                activeSensorsCount > 0
                  ? (consumption.totalLiters / activeSensorsCount).toFixed(1)
                  : '0.0'

              // Verificar si es el día más reciente (no necesariamente hoy)
              const isLatestDay = latestDate && dayjs(consumption.date).isSame(latestDate, 'day')

              return (
                <tr
                  key={consumption.date}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800 ${
                    isLatestDay ? 'bg-blue-50 dark:bg-blue-950' : ''
                  }`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {format(new Date(consumption.date), 'dd MMM yyyy', {
                              locale: es,
                            })}
                          </span>
                          {isLatestDay && (
                            <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-medium text-white">
                              Hoy
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {isLatestDay && lastMeasurementTime ? (
                            <>Última medición: {format(lastMeasurementTime, 'HH:mm', { locale: es })}</>
                          ) : (
                            format(new Date(consumption.date), 'EEEE', { locale: es })
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {consumption.totalLiters.toFixed(1)} L
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {activeSensorsCount}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {avgPerSensor} L
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {trend === 'up' && (
                      <div className="flex items-center text-red-600 dark:text-red-400">
                        <PiTrendUpDuotone className="mr-1 h-5 w-5" />
                        <span className="text-sm font-medium">
                          +
                          {prevConsumption
                            ? (
                                ((consumption.totalLiters -
                                  prevConsumption.totalLiters) /
                                  prevConsumption.totalLiters) *
                                100
                              ).toFixed(1)
                            : '0.0'}
                          %
                        </span>
                      </div>
                    )}
                    {trend === 'down' && (
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <PiTrendDownDuotone className="mr-1 h-5 w-5" />
                        <span className="text-sm font-medium">
                          {prevConsumption
                            ? (
                                ((consumption.totalLiters -
                                  prevConsumption.totalLiters) /
                                  prevConsumption.totalLiters) *
                                100
                              ).toFixed(1)
                            : '0.0'}
                          %
                        </span>
                      </div>
                    )}
                    {trend === 'stable' && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        -
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {displayData.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No hay datos disponibles para el período seleccionado
          </p>
        </div>
      )}
    </Card>
  )
}
