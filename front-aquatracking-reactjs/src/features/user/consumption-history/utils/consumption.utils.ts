import { format, subDays } from 'date-fns'

export interface ConsumptionMetrics {
  totalConsumption: string
  avgDaily: string
  changePercent: string
  efficiencyRate: number
  activeSensors: number
  avgTimeOnSystem: string
}

export const calculateMetrics = (
  filteredConsumptions: any[],
  consumptions: any[],
  sensors: any[]
): ConsumptionMetrics => {
  const today = format(new Date(), 'yyyy-MM-dd')
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

  const todayData = consumptions.find((c) => c.date === today)
  const yesterdayData = consumptions.find((c) => c.date === yesterday)

  const totalConsumption = filteredConsumptions.reduce(
    (sum, c) => sum + c.totalLiters,
    0
  )

  const avgDaily =
    filteredConsumptions.length > 0
      ? (totalConsumption / filteredConsumptions.length).toFixed(1)
      : '0.0'

  const todayConsumption = todayData?.totalLiters || 0
  const yesterdayConsumption = yesterdayData?.totalLiters || 0
  const changePercent =
    yesterdayConsumption > 0
      ? (
          ((todayConsumption - yesterdayConsumption) / yesterdayConsumption) *
          100
        ).toFixed(1)
      : '0.0'

  const avgTimeOnSystem = 'Normal'
  const efficiencyRate = Math.max(0, 100 - (parseFloat(changePercent) || 0))

  return {
    totalConsumption: totalConsumption.toFixed(1),
    avgDaily,
    changePercent,
    efficiencyRate,
    activeSensors: sensors.filter((s) => s.status === 'activo').length,
    avgTimeOnSystem,
  }
}

export const prepareChartData = (
  filteredData: any[],
  limit: number = 15
): Array<{ date: string; consumption: number }> => {
  const sorted = [...filteredData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  const lastN = sorted.slice(-limit)
  return lastN.map((c) => ({ date: c.date, consumption: c.totalLiters }))
}

export const aggregateHourlyData = (
  hourlyByHour: Record<number, { liters: number; count: number; sensors: string[] }>
) => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    liters: hourlyByHour[i]?.liters || 0,
    count: hourlyByHour[i]?.count || 0,
    sensorCount: hourlyByHour[i]?.sensors?.length || 0,
  }))
}
