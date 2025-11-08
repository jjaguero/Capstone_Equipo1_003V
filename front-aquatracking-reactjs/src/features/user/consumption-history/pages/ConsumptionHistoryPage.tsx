import Container from '@/components/shared/Container'
import Breadcrumb from '@/components/shared/Breadcrumb'
import { useConsumption } from '@/hooks/useConsumption'
import { useSensors } from '@/features/user/sensors/hooks/useSensors'
import { useAquaTrackingAuth } from '@/features/auth/hooks/useAquaTrackingAuth'
import {
  useConsumptionFilters,
  useConsumptionMetrics,
  useChartData,
} from '../hooks'
import {
  ConsumptionFilters,
  ConsumptionKPICards,
  ConsumptionChart,
  ChartTooltip,
  DailyConsumptionTable,
} from '../components'
import ExportPDFButton from '@/components/shared/ExportPDFButton'

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

  const userDailyLimit = currentUser?.limitLitersPerDay || 150
  const avgDaily = parseFloat(metrics.avgDaily) || 0

  const { chartData, tooltipData, handleMouseEnter, handleMouseLeave } =
    useChartData(sensorFilteredData, userDailyLimit, avgDaily)

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
        <Breadcrumb />

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

        <div className="flex justify-end">
          <ExportPDFButton
            measurements={consumptions}
            sensors={sensors}
            userName={currentUser?.name || 'Usuario'}
            homeAddress="Mi Hogar"
            showPeriodSelector={true}
          />
        </div>

        <ConsumptionKPICards metrics={metrics} />

        <ConsumptionChart
          chartData={chartData}
          userDailyLimit={userDailyLimit}
          metrics={metrics}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />

        <ChartTooltip data={tooltipData} />

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
