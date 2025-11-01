import Container from '@/components/shared/Container'
import { useConsumption } from '@/hooks/useConsumption'
import { useSensors } from '@/features/user/sensors/hooks/useSensors'
import { useAquaTrackingAuth } from '@/features/auth/hooks/useAquaTrackingAuth'
import {
  useConsumptionFilters,
  useConsumptionMetrics,
  useHourlyConsumption,
  useChartData,
} from '../hooks'
import {
  ConsumptionFilters,
  ConsumptionKPICards,
  ConsumptionChart,
  ChartTooltip,
  HourlyConsumptionTable,
  DailyConsumptionTable,
} from '../components'

const ConsumptionHistoryPage = () => {
  const { currentUser } = useAquaTrackingAuth()
  const { consumptions, loading: consumptionLoading } = useConsumption(
    currentUser?.homeId
  )
  const { sensors, loading: sensorsLoading } = useSensors(currentUser?.homeId)

  const {
    timePeriod,
    setTimePeriod,
    selectedSensorId,
    setSelectedSensorId,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    availableDates,
    filteredConsumptions,
    sensorFilteredData,
  } = useConsumptionFilters(consumptions)

  const metrics = useConsumptionMetrics(
    filteredConsumptions,
    consumptions,
    sensors
  )

  const { hourlyConsumption, loadingHourly, errorHourly } =
    useHourlyConsumption(selectedSensorId, !!selectedSensorId)

  const { chartData, tooltipData, handleMouseEnter, handleMouseLeave } =
    useChartData(sensorFilteredData)

  const userDailyLimit = currentUser?.limitLitersPerDay || 150

  const handleClearFilters = () => {
    setSelectedSensorId(null)
    if (availableDates.length > 0) {
      const last = availableDates[availableDates.length - 1]
      const monthBefore = last.subtract(1, 'month')
      const from =
        availableDates.find((d) => !d.isBefore(monthBefore, 'day')) ||
        availableDates[0]
      setDateTo(last)
      setDateFrom(from)
    }
  }

  if (consumptionLoading || sensorsLoading) {
    return (
      <Container className="h-full">
        <div className="flex h-full items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
        </div>
      </Container>
    )
  }

  return (
    <Container className="h-full">
      <div className="space-y-6 py-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Historial de Consumo
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Analiza tu consumo de agua en detalle con métricas y tendencias
          </p>
        </div>

        <ConsumptionFilters
          timePeriod={timePeriod}
          onTimePeriodChange={setTimePeriod}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          selectedSensorId={selectedSensorId}
          onSelectedSensorIdChange={setSelectedSensorId}
          sensors={sensors}
          onClearFilters={handleClearFilters}
          availableDates={availableDates}
        />

        <ConsumptionKPICards metrics={metrics} />

        <ConsumptionChart
          chartData={chartData}
          userDailyLimit={userDailyLimit}
          metrics={metrics}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />

        <ChartTooltip data={tooltipData} />

        {selectedSensorId && (
          <HourlyConsumptionTable
            hourlyConsumption={hourlyConsumption}
            loading={loadingHourly}
            error={errorHourly}
          />
        )}

        <DailyConsumptionTable
          consumptions={sensorFilteredData}
          dateFrom={dateFrom}
          dateTo={dateTo}
          selectedSensorId={selectedSensorId}
        />
      </div>
    </Container>
  )
}

export default ConsumptionHistoryPage
