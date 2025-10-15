import { useState, useEffect } from 'react'
import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'

interface SensorConsumption {
    sensorId: string
    todayLiters: number
    yesterdayLiters: number
    weekLiters: number
    lastReading?: Date
}

interface UseSensorConsumptionReturn {
    getConsumption: (sensorId: string) => SensorConsumption | null
    loading: boolean
    error: string | null
}

export const useSensorConsumption = (): UseSensorConsumptionReturn => {
    const [consumptionMap, setConsumptionMap] = useState<Map<string, SensorConsumption>>(new Map())
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchConsumption = async () => {
            try {
                setLoading(true)
                setError(null)

                // Obtener todas las mediciones del día de hoy
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                
                const yesterday = new Date(today)
                yesterday.setDate(yesterday.getDate() - 1)
                
                const weekAgo = new Date(today)
                weekAgo.setDate(weekAgo.getDate() - 7)

                // Obtener measurements (todas)
                const response = await apiClient.get(ENDPOINTS.MEASUREMENTS)
                const measurements = response.data

                // Agrupar por sensor
                const consumptionData = new Map<string, SensorConsumption>()

                measurements.forEach((measurement: any) => {
                    const sensorId = measurement.sensorId
                    const measurementDate = new Date(measurement.startTime)
                    
                    if (!consumptionData.has(sensorId)) {
                        consumptionData.set(sensorId, {
                            sensorId,
                            todayLiters: 0,
                            yesterdayLiters: 0,
                            weekLiters: 0,
                            lastReading: undefined,
                        })
                    }

                    const data = consumptionData.get(sensorId)!

                    // Consumo hoy
                    if (measurementDate >= today) {
                        data.todayLiters += measurement.liters
                    }

                    // Consumo ayer
                    if (measurementDate >= yesterday && measurementDate < today) {
                        data.yesterdayLiters += measurement.liters
                    }

                    // Consumo última semana
                    if (measurementDate >= weekAgo) {
                        data.weekLiters += measurement.liters
                    }

                    // Última lectura
                    if (!data.lastReading || measurementDate > data.lastReading) {
                        data.lastReading = measurementDate
                    }
                })

                setConsumptionMap(consumptionData)
            } catch (err: any) {
                console.error('Error fetching sensor consumption:', err)
                setError(err.message || 'Error al cargar consumo de sensores')
            } finally {
                setLoading(false)
            }
        }

        fetchConsumption()
    }, [])

    const getConsumption = (sensorId: string): SensorConsumption | null => {
        return consumptionMap.get(sensorId) || null
    }

    return {
        getConsumption,
        loading,
        error,
    }
}

export default useSensorConsumption
