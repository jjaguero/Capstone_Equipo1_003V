import { useState, useMemo } from 'react'
import { prepareChartData } from '../utils/consumption.utils'

export const useChartData = (sensorFilteredData: any[]) => {
  const [tooltipData, setTooltipData] = useState<{
    x: number
    y: number
    date: string
    liters: number
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
    setTooltipData({
      x: rect.left + rect.width / 2,
      y: rect.top,
      date,
      liters,
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
