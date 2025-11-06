import { useState, useMemo, useEffect } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import { useTodayConsumption } from '@/hooks/useTodayConsumption'
import { useAquaTrackingAuth } from '@/features/auth/hooks/useAquaTrackingAuth'

export const useConsumptionFilters = (consumptions: any[]) => {
  const [timePeriod, setTimePeriod] = useState<'Weekly' | 'Monthly' | 'Annually'>('Monthly')
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null)
  const [dateTo, setDateTo] = useState<Dayjs | null>(null)
  
  const { currentUser } = useAquaTrackingAuth()
  const { todayLiters } = useTodayConsumption(currentUser?.homeId)

  // Combinar consumos históricos con el consumo de hoy (si existe)
  const consumptionsWithToday = useMemo(() => {
    if (!consumptions || consumptions.length === 0) {
      return []
    }
    
    // Obtener la fecha del día más reciente en los datos
    const sortedByDate = [...consumptions].sort((a, b) => 
      dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
    )
    const latestDate = dayjs(sortedByDate[0].date).startOf('day')
    
    // Verificar si ese día ya existe en los consumos
    const latestDayExists = consumptions.some(c => 
      dayjs(c.date).isSame(latestDate, 'day')
    )
    
    // Si existe, actualizar con el valor en tiempo real
    if (latestDayExists && todayLiters > 0) {
      return consumptions.map(c => {
        if (dayjs(c.date).isSame(latestDate, 'day')) {
          return {
            ...c,
            totalLiters: todayLiters,
          }
        }
        return c
      })
    }
    
    return consumptions
  }, [consumptions, todayLiters])

  const availableDates = useMemo(() => {
    const unique = Array.from(new Set(consumptionsWithToday.map((c) => c.date)))
      .map((dateStr) => dayjs(dateStr))
      .sort((a, b) => a.valueOf() - b.valueOf())
    return unique
  }, [consumptionsWithToday])

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
    return consumptionsWithToday.filter((c) => {
      if (!dateFrom || !dateTo) return false
      const d = dayjs(c.date)
      return (
        (d.isSame(dateFrom, 'day') || d.isAfter(dateFrom, 'day')) &&
        (d.isSame(dateTo, 'day') || d.isBefore(dateTo, 'day'))
      )
    })
  }, [consumptionsWithToday, dateFrom, dateTo])

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
