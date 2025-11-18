import { useMemo } from 'react'
import { calculateMetrics } from '../utils/consumption.utils'

export const useConsumptionMetrics = (
  filteredConsumptions: any[],
  consumptions: any[],
  sensors: any[]
) => {
  const metrics = useMemo(() => {
    return calculateMetrics(filteredConsumptions, consumptions, sensors)
  }, [filteredConsumptions, consumptions, sensors])

  return metrics
}
