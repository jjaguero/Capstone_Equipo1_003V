import { useState, useEffect } from 'react'
import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import dayjs, { Dayjs } from 'dayjs'

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
    dateFrom: Dayjs | null
    dateTo: Dayjs | null
    setDateFrom: (date: Dayjs | null) => void
    setDateTo: (date: Dayjs | null) => void
    availableDates: Dayjs[]
    handleClearFilters: () => void
}

export const useSectors = (): UseSectorsReturn => {
    const [sectors, setSectors] = useState<Sector[]>([])
    const [stats, setStats] = useState<SectorStats[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month')
    const [dateFrom, setDateFrom] = useState<Dayjs | null>(null)
    const [dateTo, setDateTo] = useState<Dayjs | null>(null)
    const [availableDates, setAvailableDates] = useState<Dayjs[]>([])
    const [allConsumptions, setAllConsumptions] = useState<any[]>([])

    const fetchData = async () => {
        try {
            setLoading(true)
            setError(null)

            // Fetch sectors
            const sectorsResponse = await apiClient.get<Sector[]>(ENDPOINTS.SECTORS)
            const sectorsData = sectorsResponse.data.filter(s => s.active)

            // Fetch homes
            const homesResponse = await apiClient.get(ENDPOINTS.HOMES)
            const homesData = homesResponse.data

            // Fetch daily consumption
            const consumptionResponse = await apiClient.get(ENDPOINTS.DAILY_CONSUMPTION)
            const allConsumptionData = consumptionResponse.data
            setAllConsumptions(allConsumptionData)

            // Calcular fechas disponibles
            const dates = allConsumptionData.map((c: any) => dayjs(c.date))
            const uniqueDates: Dayjs[] = Array.from(new Set(dates.map((d: Dayjs) => d.format('YYYY-MM-DD'))))
                .map((dateStr) => dayjs(dateStr as string))
                .sort((a, b) => a.valueOf() - b.valueOf())
            setAvailableDates(uniqueDates)

            // Inicializar fechas si es la primera vez
            if (!dateFrom && !dateTo && uniqueDates.length > 0) {
                const last = uniqueDates[uniqueDates.length - 1]
                const monthBefore = last.subtract(1, 'month')
                const from = uniqueDates.find(d => !d.isBefore(monthBefore, 'day')) || uniqueDates[0]
                setDateFrom(from)
                setDateTo(last)
            }

            // Filtrar consumptions por rango de fechas seleccionado
            let consumptionData = allConsumptionData
            if (dateFrom && dateTo) {
                consumptionData = allConsumptionData.filter((c: any) => {
                    const consumptionDate = dayjs(c.date)
                    return (consumptionDate.isAfter(dateFrom, 'day') || consumptionDate.isSame(dateFrom, 'day')) && 
                           (consumptionDate.isBefore(dateTo, 'day') || consumptionDate.isSame(dateTo, 'day'))
                })
            }

            // Fetch alerts
            const alertsResponse = await apiClient.get(ENDPOINTS.ALERTS)
            const alertsData = alertsResponse.data

            // Calculate stats per sector
            const sectorStats: SectorStats[] = sectorsData.map(sector => {
                const sectorHomes = homesData.filter((h: any) => h.sectorId === sector._id && h.active)
                const homeIds = sectorHomes.map((h: any) => String(h._id))
                const totalMembers = sectorHomes.reduce((sum: number, h: any) => sum + (h.members || 0), 0)

                const sectorConsumption = consumptionData.filter((c: any) => homeIds.includes(String(c.homeId)))
                const totalConsumption = sectorConsumption.reduce((sum: number, c: any) => sum + (c.totalLiters || c.consumedLiters || 0), 0)
                
                const daysCount = sectorConsumption.length
                const averagePerDay = daysCount > 0 ? totalConsumption / daysCount : 0
                const averageConsumption = sectorHomes.length > 0 ? averagePerDay : 0

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
        
        // Actualizar fechas según el período seleccionado
        if (availableDates.length > 0) {
            const last = availableDates[availableDates.length - 1]
            let from: Dayjs
            
            switch (period) {
                case 'week':
                    // Últimos 7 días
                    const weekBefore = last.subtract(7, 'day')
                    from = availableDates.find(d => !d.isBefore(weekBefore, 'day')) || availableDates[0]
                    break
                case 'month':
                    // Último mes
                    const monthBefore = last.subtract(1, 'month')
                    from = availableDates.find(d => !d.isBefore(monthBefore, 'day')) || availableDates[0]
                    break
                case 'quarter':
                    // Últimos 3 meses (anual)
                    const quarterBefore = last.subtract(3, 'month')
                    from = availableDates.find(d => !d.isBefore(quarterBefore, 'day')) || availableDates[0]
                    break
                default:
                    // Por defecto, último mes
                    const defaultBefore = last.subtract(1, 'month')
                    from = availableDates.find(d => !d.isBefore(defaultBefore, 'day')) || availableDates[0]
            }
            
            setDateFrom(from)
            setDateTo(last)
        }
    }

    const handleClearFilters = () => {
        if (availableDates.length > 0) {
            const last = availableDates[availableDates.length - 1]
            const monthBefore = last.subtract(1, 'month')
            const from = availableDates.find(d => !d.isBefore(monthBefore, 'day')) || availableDates[0]
            setDateTo(last)
            setDateFrom(from)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        if (allConsumptions.length > 0 && dateFrom && dateTo) {
            fetchData()
        }
    }, [dateFrom, dateTo])

    return {
        sectors,
        stats,
        loading,
        error,
        refetch: fetchData,
        filterByPeriod,
        currentPeriod: periodFilter,
        dateFrom,
        dateTo,
        setDateFrom,
        setDateTo,
        availableDates,
        handleClearFilters,
    }
}

export default useSectors
