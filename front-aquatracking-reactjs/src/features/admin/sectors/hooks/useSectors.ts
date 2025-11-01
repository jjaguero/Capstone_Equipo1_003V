import { useState, useEffect } from 'react'
import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'

interface Sector {
    _id: string
    name: string
    description: string
    active: boolean
}

interface SectorStats {
    sectorId: string
    sectorName: string
    totalHomes: number
    totalConsumption: number
    averageConsumption: number
    totalAlerts: number
    pendingAlerts: number
    totalMembers: number
}

type PeriodFilter = 'week' | 'month' | 'quarter' | null

interface UseSectorsReturn {
    sectors: Sector[]
    stats: SectorStats[]
    loading: boolean
    error: string | null
    refetch: () => void
    filterByPeriod: (period: PeriodFilter) => void
    currentPeriod: PeriodFilter
}

export const useSectors = (): UseSectorsReturn => {
    const [sectors, setSectors] = useState<Sector[]>([])
    const [stats, setStats] = useState<SectorStats[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month')

    const fetchData = async () => {
        try {
            setLoading(true)
            setError(null)

            // Calcular rango de fechas según el período
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            let startDate: Date | null = null

            switch (periodFilter) {
                case 'week':
                    startDate = new Date(today)
                    startDate.setDate(startDate.getDate() - 7)
                    break
                case 'month':
                    startDate = new Date(today)
                    startDate.setMonth(startDate.getMonth() - 1)
                    break
                case 'quarter':
                    startDate = new Date(today)
                    startDate.setMonth(startDate.getMonth() - 3)
                    break
            }

            // Fetch sectors
            const sectorsResponse = await apiClient.get<Sector[]>(ENDPOINTS.SECTORS)
            const sectorsData = sectorsResponse.data.filter(s => s.active)

            // Fetch homes
            const homesResponse = await apiClient.get(ENDPOINTS.HOMES)
            const homesData = homesResponse.data

            // Fetch daily consumption (filtrado por período)
            const consumptionResponse = await apiClient.get(ENDPOINTS.DAILY_CONSUMPTION)
            let consumptionData = consumptionResponse.data

            // Filtrar consumptions por período si hay filtro activo
            if (startDate) {
                consumptionData = consumptionData.filter((c: any) => {
                    const consumptionDate = new Date(c.date)
                    return consumptionDate >= startDate && consumptionDate <= today
                })
            }

            // Fetch alerts
            const alertsResponse = await apiClient.get(ENDPOINTS.ALERTS)
            const alertsData = alertsResponse.data

            // Calculate stats per sector
            const sectorStats: SectorStats[] = sectorsData.map(sector => {
                // Homes in this sector
                const sectorHomes = homesData.filter((h: any) => h.sectorId === sector._id && h.active)
                // Convertir homeIds a string para comparar con consumptionData
                const homeIds = sectorHomes.map((h: any) => String(h._id))

                // Total members
                const totalMembers = sectorHomes.reduce((sum: number, h: any) => sum + (h.members || 0), 0)

                // Consumption for these homes (sumar todos los registros históricos)
                const sectorConsumption = consumptionData.filter((c: any) => homeIds.includes(String(c.homeId)))
                const totalConsumption = sectorConsumption.reduce((sum: number, c: any) => sum + (c.totalLiters || c.consumedLiters || 0), 0)
                
                // Calcular promedio por hogar basado en el total de días registrados
                const daysCount = sectorConsumption.length
                const averagePerDay = daysCount > 0 ? totalConsumption / daysCount : 0
                const averageConsumption = sectorHomes.length > 0 ? averagePerDay : 0

                // Alerts for these homes (convertir homeIds a string también)
                const sectorAlerts = alertsData.filter((a: any) => homeIds.includes(String(a.homeId)))
                const pendingAlerts = sectorAlerts.filter((a: any) => !a.resolved).length

                return {
                    sectorId: sector._id,
                    sectorName: sector.name,
                    totalHomes: sectorHomes.length,
                    totalConsumption: Math.round(totalConsumption) || 0,
                    averageConsumption: Math.round(averageConsumption) || 0,
                    totalAlerts: sectorAlerts.length,
                    pendingAlerts,
                    totalMembers,
                }
            })

            setSectors(sectorsData)
            setStats(sectorStats)
        } catch (err: any) {
            console.error('Error fetching sectors data:', err)
            setError(err.message || 'Error al cargar datos de sectores')
        } finally {
            setLoading(false)
        }
    }

    const filterByPeriod = (period: PeriodFilter) => {
        setPeriodFilter(period)
    }

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        fetchData()
    }, [periodFilter])

    return {
        sectors,
        stats,
        loading,
        error,
        refetch: fetchData,
        filterByPeriod,
        currentPeriod: periodFilter,
    }
}

export default useSectors
