import { useState, useEffect } from 'react'
import ApiService from '@/services/ApiService'

export interface HourlyConsumptionData {
  hour: number
  consumption: number
}

export const useHourlyConsumption = (
  selectedSensorId: string | null,
  shouldLoad: boolean
) => {
  const [hourlyConsumption, setHourlyConsumption] = useState<HourlyConsumptionData[]>([])
  const [loadingHourly, setLoadingHourly] = useState(false)
  const [errorHourly, setErrorHourly] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedSensorId || !shouldLoad) {
      setHourlyConsumption([])
      return
    }

    const loadHourlyData = async () => {
      setLoadingHourly(true)
      setErrorHourly(null)
      try {
        const response = await ApiService.fetchDataWithAxios<HourlyConsumptionData[]>({
          url: `/measurements/sensor/${selectedSensorId}/hourly`,
          method: 'get',
        })

        if (response && Array.isArray(response)) {
          setHourlyConsumption(response)
        } else {
          setHourlyConsumption([])
        }
      } catch (err: any) {
        console.error('Error al cargar datos horarios:', err)
        setErrorHourly(err?.message || 'Error al cargar datos horarios')
        setHourlyConsumption([])
      } finally {
        setLoadingHourly(false)
      }
    }

    loadHourlyData()
  }, [selectedSensorId, shouldLoad])

  return { hourlyConsumption, loadingHourly, errorHourly }
}
