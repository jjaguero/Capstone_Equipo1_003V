import { format, subDays } from 'date-fns'

export interface ConsumptionMetrics {
  totalConsumption: string
  avgDaily: string
  changePercent: string
  efficiencyRate: number
  activeSensors: number
  avgTimeOnSystem: string
}

// Función helper para formatear números con separadores de miles (sin decimales)
const formatNumber = (num: number): string => {
  return Math.round(num).toLocaleString('es-CL')
}

export const calculateMetrics = (
  filteredConsumptions: any[],
  consumptions: any[],
  sensors: any[]
): ConsumptionMetrics => {
  // Contar sensores activos (verificar tanto 'activo' como 'active')
  const activeSensorsCount = sensors?.filter(
    (s) => s.status?.toLowerCase() === 'activo' || s.status?.toLowerCase() === 'active'
  ).length || 0

  // Si no hay datos filtrados, retornar métricas vacías
  if (!filteredConsumptions || filteredConsumptions.length === 0) {
    return {
      totalConsumption: '0',
      avgDaily: '0',
      changePercent: '0.0',
      efficiencyRate: 100,
      activeSensors: activeSensorsCount,
      avgTimeOnSystem: 'Normal',
    }
  }

  const totalConsumption = filteredConsumptions.reduce(
    (sum, c) => sum + (c.totalLiters || 0),
    0
  )

  const avgDailyNum =
    filteredConsumptions.length > 0
      ? totalConsumption / filteredConsumptions.length
      : 0

  // Calcular cambio comparando el primer y último día del período filtrado
  const sortedData = [...filteredConsumptions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  
  const firstDayConsumption = sortedData[0]?.totalLiters || 0
  const lastDayConsumption = sortedData[sortedData.length - 1]?.totalLiters || 0
  
  const changePercentNum =
    firstDayConsumption > 0
      ? ((lastDayConsumption - firstDayConsumption) / firstDayConsumption) * 100
      : 0

  const avgTimeOnSystem = 'Normal'
  const efficiencyRate = Math.max(0, 100 - Math.abs(changePercentNum))

  return {
    totalConsumption: formatNumber(totalConsumption),
    avgDaily: formatNumber(avgDailyNum),
    changePercent: changePercentNum.toFixed(1),
    efficiencyRate,
    activeSensors: activeSensorsCount,
    avgTimeOnSystem,
  }
}

export const prepareChartData = (
  filteredData: any[]
): Array<{ date: string; consumption: number }> => {
  if (!filteredData || filteredData.length === 0) {
    return []
  }
  
  const sorted = [...filteredData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  return sorted.map((c) => ({ date: c.date, consumption: c.totalLiters || 0 }))
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
