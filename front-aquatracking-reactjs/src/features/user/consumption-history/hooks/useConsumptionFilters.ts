import { useState, useMemo, useEffect } from 'react'
import dayjs, { Dayjs } from 'dayjs'

export const useConsumptionFilters = (consumptions: any[]) => {
  const [timePeriod, setTimePeriod] = useState<'Weekly' | 'Monthly' | 'Annually'>('Monthly')
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null)
  const [dateTo, setDateTo] = useState<Dayjs | null>(null)

  const availableDates = useMemo(() => {
    const unique = Array.from(new Set(consumptions.map((c) => c.date)))
      .map((dateStr) => dayjs(dateStr))
      .sort((a, b) => a.valueOf() - b.valueOf())
    return unique
  }, [consumptions])

  useEffect(() => {
    if (availableDates.length > 0) {
      const last = availableDates[availableDates.length - 1]
      let from: Dayjs

      switch (timePeriod) {
        case 'Weekly':
          from = last.subtract(1, 'week')
          break
        case 'Monthly':
          from = last.subtract(1, 'month')
          break
        case 'Annually':
          from = last.subtract(1, 'year')
          break
        default:
          from = last.subtract(1, 'month')
      }

      const foundFrom = availableDates.find((d) => !d.isBefore(from, 'day')) || availableDates[0]
      setDateTo(last)
      setDateFrom(foundFrom)
    }
  }, [availableDates, timePeriod])

  const filteredConsumptions = useMemo(() => {
    return consumptions.filter((c) => {
      if (!dateFrom || !dateTo) return false
      const d = dayjs(c.date)
      return (
        (d.isSame(dateFrom, 'day') || d.isAfter(dateFrom, 'day')) &&
        (d.isSame(dateTo, 'day') || d.isBefore(dateTo, 'day'))
      )
    })
  }, [consumptions, dateFrom, dateTo])

  const sensorFilteredData = useMemo(() => {
    if (!selectedSensorId) return filteredConsumptions
    
    return filteredConsumptions
      .map((consumption) => {
        if (!consumption.bySensor) {
          return null
        }
        
        const sensorData = consumption.bySensor.find((bs: any) => 
          String(bs.sensorId) === String(selectedSensorId)
        )
        
        if (!sensorData || sensorData.liters === 0) {
          return null
        }
        
        return {
          ...consumption,
          totalLiters: sensorData.liters,
        }
      })
      .filter((item) => item !== null)
  }, [filteredConsumptions, selectedSensorId])

  return {
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
  }
}
