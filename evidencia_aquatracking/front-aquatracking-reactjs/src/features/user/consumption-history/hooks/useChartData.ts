import { useState, useMemo } from 'react'
import { prepareChartData } from '../utils/consumption.utils'

export const useChartData = (sensorFilteredData: any[], userDailyLimit: number, avgDaily: number) => {
  const [tooltipData, setTooltipData] = useState<{
    x: number
    y: number
    date: string
    liters: number
    dayOfWeek: string
    percentOfLimit: number
    diffFromAvg: number
  } | null>(null)

  const chartData = useMemo(() => {
    return prepareChartData(sensorFilteredData)
  }, [sensorFilteredData])

  const handleMouseEnter = (
    e: React.MouseEvent<SVGCircleElement>,
    date: string,
    liters: number
  ) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const dateObj = new Date(date)
    const dayOfWeek = dateObj.toLocaleDateString('es-ES', { weekday: 'long' })
    const percentOfLimit = userDailyLimit > 0 ? (liters / userDailyLimit) * 100 : 0
    const diffFromAvg = liters - avgDaily

    setTooltipData({
      x: rect.left + rect.width / 2,
      y: rect.top,
      date,
      liters,
      dayOfWeek,
      percentOfLimit,
      diffFromAvg,
    })
  }

  const handleMouseLeave = () => {
    setTooltipData(null)
  }

  return {
    chartData,
    tooltipData,
    handleMouseEnter,
    handleMouseLeave,
  }
}
