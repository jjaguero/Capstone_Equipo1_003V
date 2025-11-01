import { useState, useEffect } from 'react'

interface ConsumptionConfig {
  people: number
  sensors: number
  avgConsumptionPerPerson: number
  customLimit: number
  useAutoCalculation: boolean
}

export const useConsumptionConfig = (
  currentUser: any,
  sensorsLength: number,
  consumptions: any[]
) => {
  const [consumptionConfig, setConsumptionConfig] = useState<ConsumptionConfig>({
    people: currentUser?.people || 1,
    sensors: sensorsLength,
    avgConsumptionPerPerson: 150,
    customLimit: currentUser?.limitLitersPerDay || 0,
    useAutoCalculation: true,
  })

  useEffect(() => {
    setConsumptionConfig((prev) => ({
      ...prev,
      sensors: sensorsLength,
    }))
  }, [sensorsLength])

  const getRealAverageConsumption = () => {
    if (consumptions.length === 0) return 0
    const totalConsumption = consumptions.reduce((sum, c) => sum + c.totalLiters, 0)
    return Math.round(totalConsumption / consumptions.length)
  }

  const getCalculatedLimit = () => {
    const people = consumptionConfig.people
    const sensorsCount = sensorsLength
    const avgPerPerson = consumptionConfig.avgConsumptionPerPerson

    const sensorFactor = sensorsCount > 0 ? 1 + sensorsCount * 0.05 : 1.2

    return Math.round(people * avgPerPerson * sensorFactor)
  }

  return {
    consumptionConfig,
    setConsumptionConfig,
    getRealAverageConsumption,
    getCalculatedLimit,
  }
}
