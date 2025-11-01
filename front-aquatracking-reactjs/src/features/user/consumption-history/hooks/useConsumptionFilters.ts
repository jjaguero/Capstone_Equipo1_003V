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
      let monthBefore = last.subtract(1, 'month')
      let from =
        availableDates.find((d) => !d.isBefore(monthBefore, 'day')) ||
        availableDates[0]
      setDateTo(last)
      setDateFrom(from)
    }
  }, [availableDates])

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
    
    return filteredConsumptions.map((consumption) => ({
      ...consumption,
      totalLiters:
        consumption.bySensor.find((bs: any) => bs.sensorId === selectedSensorId)?.liters || 0,
    }))
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
