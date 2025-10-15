import { useState, useEffect } from 'react'
import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'

type PeriodFilter = 'today' | 'week' | 'month' | 'custom' | null

interface UseConsumptionsReturn {
    consumptions: DailyConsumption[]
    stats: ConsumptionStats | null
    loading: boolean
    error: string | null
    refetch: () => void
    filterByHome: (homeId: string | null) => void
    filterByDateRange: (startDate: string | null, endDate: string | null) => void
    filterByPeriod: (period: PeriodFilter) => void
    currentPeriod: PeriodFilter
}

interface DailyConsumption {
    _id: string
    homeId: string
    date: string
    totalLiters: number
    bySensor: {
        sensorId: string
        liters: number
    }[]
    recommendedLiters: number
    limitLiters: number
    alerts: {
        type: string
        message: string
        triggeredAt: string
    }[]
    createdAt?: string
    updatedAt?: string
}

interface ConsumptionStats {
    totalConsumed: number
    averageDaily: number
    totalAlerts: number
    homesCount: number
    maxDailyConsumption: number
    minDailyConsumption: number
}

interface UseConsumptionReturn {
    consumptions: DailyConsumption[]
    stats: ConsumptionStats | null
    loading: boolean
    error: string | null
    refetch: () => void
    filterByHome: (homeId: string | null) => void
    filterByDateRange: (startDate: string | null, endDate: string | null) => void
    filterByPeriod: (period: PeriodFilter) => void
    currentPeriod: PeriodFilter
}

export const useConsumption = (): UseConsumptionReturn => {
    const [consumptions, setConsumptions] = useState<DailyConsumption[]>([])
    const [filteredConsumptions, setFilteredConsumptions] = useState<DailyConsumption[]>([])
    const [stats, setStats] = useState<ConsumptionStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [homeFilter, setHomeFilter] = useState<string | null>(null)
    const [periodFilter, setPeriodFilter] = useState<PeriodFilter>(null)
    const [dateRangeFilter, setDateRangeFilter] = useState<{ start: string | null; end: string | null }>({
        start: null,
        end: null,
    })

    const fetchConsumptions = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await apiClient.get<DailyConsumption[]>(ENDPOINTS.DAILY_CONSUMPTION)
            const data = response.data

            setConsumptions(data)
            setFilteredConsumptions(data)
            calculateStats(data)
        } catch (err: any) {
            console.error('Error fetching consumptions:', err)
            setError(err.message || 'Error al cargar consumos')
        } finally {
            setLoading(false)
        }
    }

    const calculateStats = (data: DailyConsumption[]) => {
        if (data.length === 0) {
            setStats(null)
            return
        }

        const totalConsumed = data.reduce((sum, item) => sum + item.totalLiters, 0)
        const averageDaily = totalConsumed / data.length
        const totalAlerts = data.reduce((sum, item) => sum + item.alerts.length, 0)
        
        // Contar homes únicos
        const uniqueHomes = new Set(data.map(item => item.homeId))
        const homesCount = uniqueHomes.size

        // Consumos máximo y mínimo
        const consumptionValues = data.map(item => item.totalLiters)
        const maxDailyConsumption = Math.max(...consumptionValues)
        const minDailyConsumption = Math.min(...consumptionValues)

        setStats({
            totalConsumed: Math.round(totalConsumed),
            averageDaily: Math.round(averageDaily),
            totalAlerts,
            homesCount,
            maxDailyConsumption: Math.round(maxDailyConsumption),
            minDailyConsumption: Math.round(minDailyConsumption),
        })
    }

    const applyFilters = () => {
        let filtered = [...consumptions]

        // Filtro por home
        if (homeFilter) {
            filtered = filtered.filter(item => item.homeId === homeFilter)
        }

        // Filtro por rango de fechas
        if (dateRangeFilter.start || dateRangeFilter.end) {
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.date)
                const start = dateRangeFilter.start ? new Date(dateRangeFilter.start) : null
                const end = dateRangeFilter.end ? new Date(dateRangeFilter.end) : null

                if (start && itemDate < start) return false
                if (end && itemDate > end) return false
                return true
            })
        }

        setFilteredConsumptions(filtered)
        calculateStats(filtered)
    }

    const filterByHome = (homeId: string | null) => {
        setHomeFilter(homeId)
    }

    const filterByDateRange = (startDate: string | null, endDate: string | null) => {
        setDateRangeFilter({ start: startDate, end: endDate })
        setPeriodFilter('custom')
    }

    const filterByPeriod = (period: PeriodFilter) => {
        setPeriodFilter(period)
        
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        
        switch (period) {
            case 'today':
                setDateRangeFilter({
                    start: today.toISOString().split('T')[0],
                    end: today.toISOString().split('T')[0],
                })
                break
            case 'week':
                const weekAgo = new Date(today)
                weekAgo.setDate(weekAgo.getDate() - 7)
                setDateRangeFilter({
                    start: weekAgo.toISOString().split('T')[0],
                    end: today.toISOString().split('T')[0],
                })
                break
            case 'month':
                const monthAgo = new Date(today)
                monthAgo.setMonth(monthAgo.getMonth() - 1)
                setDateRangeFilter({
                    start: monthAgo.toISOString().split('T')[0],
                    end: today.toISOString().split('T')[0],
                })
                break
            case null:
                setDateRangeFilter({ start: null, end: null })
                break
        }
    }

    useEffect(() => {
        fetchConsumptions()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [homeFilter, dateRangeFilter, consumptions])

    return {
        consumptions: filteredConsumptions,
        stats,
        loading,
        error,
        refetch: fetchConsumptions,
        filterByHome,
        filterByDateRange,
        filterByPeriod,
        currentPeriod: periodFilter,
    }
}

export default useConsumption
