import { useState, useEffect } from 'react'
import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import dayjs, { Dayjs } from 'dayjs'
import { Sector } from '@/@types/entities/sector.type'

interface PlatformStats {
    totalUsers: number
    activeUsers: number
    totalHomes: number
    activeHomes: number
    totalSensors: number
    activeSensors: number
    totalConsumption: number
    totalAlerts: number
    pendingAlerts: number
    currentMonthConsumption: number
    previousMonthConsumption: number
    consumptionTrend: number // % de cambio
}

interface TopHome {
    homeId: string
    homeName: string
    totalConsumption: number
    averageDaily: number
    members: number
    consumptionPerPerson: number
    alertCount?: number
    status?: 'critical' | 'high' | 'warning'
}

interface MonthlyTrend {
    date: string
    consumption: number
}

type PeriodFilter = 'week' | 'month' | 'quarter' | null

interface UseStatisticsReturn {
    platformStats: PlatformStats | null
    topHomes: TopHome[]
    monthlyTrend: MonthlyTrend[]
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
    sectors: Sector[]
    selectedSector: string | null
    setSelectedSector: (sectorId: string | null) => void
}

export const useStatistics = (): UseStatisticsReturn => {
    const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
    const [topHomes, setTopHomes] = useState<TopHome[]>([])
    const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month')
    const [dateFrom, setDateFrom] = useState<Dayjs | null>(null)
    const [dateTo, setDateTo] = useState<Dayjs | null>(null)
    const [availableDates, setAvailableDates] = useState<Dayjs[]>([])
    const [allConsumptions, setAllConsumptions] = useState<any[]>([])
    const [sectors, setSectors] = useState<Sector[]>([])
    const [selectedSector, setSelectedSector] = useState<string | null>(null)

    const fetchStatistics = async () => {
        try {
            setLoading(true)
            setError(null)

            // Fetch all data including sectors
            const [usersRes, homesRes, sensorsRes, consumptionRes, alertsRes, sectorsRes] = await Promise.all([
                apiClient.get(ENDPOINTS.USERS),
                apiClient.get(ENDPOINTS.HOMES),
                apiClient.get(ENDPOINTS.SENSORS),
                apiClient.get(ENDPOINTS.DAILY_CONSUMPTION),
                apiClient.get(ENDPOINTS.ALERTS),
                apiClient.get(ENDPOINTS.SECTORS),
            ])

            const users = usersRes.data
            const homes = homesRes.data
            const sensors = sensorsRes.data
            const allConsumptionData = consumptionRes.data
            const alerts = alertsRes.data
            const sectorsData = sectorsRes.data.filter((s: Sector) => s.active)

            setSectors(sectorsData)
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

            // Filtrar homes por sector si hay uno seleccionado
            let filteredHomes = homes
            if (selectedSector) {
                filteredHomes = homes.filter((h: any) => h.sectorId === selectedSector)
            }

            // Filtrar consumptions por sector y rango de fechas
            let consumptions = allConsumptionData
            if (selectedSector) {
                const homeIdsInSector = filteredHomes.map((h: any) => h._id)
                consumptions = consumptions.filter((c: any) => homeIdsInSector.includes(c.homeId))
            }
            if (dateFrom && dateTo) {
                consumptions = consumptions.filter((c: any) => {
                    const consumptionDate = dayjs(c.date)
                    return (consumptionDate.isAfter(dateFrom, 'day') || consumptionDate.isSame(dateFrom, 'day')) && 
                           (consumptionDate.isBefore(dateTo, 'day') || consumptionDate.isSame(dateTo, 'day'))
                })
            }

            // Filtrar usuarios, sensores y alertas por sector si está seleccionado
            let filteredUsers = users
            let filteredSensors = sensors
            let filteredAlerts = alerts
            if (selectedSector) {
                const homeIdsInSector = filteredHomes.map((h: any) => h._id)
                filteredUsers = users.filter((u: any) => homeIdsInSector.includes(u.homeId))
                filteredSensors = sensors.filter((s: any) => homeIdsInSector.includes(s.homeId))
                filteredAlerts = alerts.filter((a: any) => homeIdsInSector.includes(a.homeId))
            }

            // Calculate platform stats
            const now = new Date()
            const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
            const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

            const currentMonthConsumptions = consumptions.filter((c: any) => 
                new Date(c.date) >= currentMonth
            )
            const previousMonthConsumptions = consumptions.filter((c: any) => {
                const date = new Date(c.date)
                return date >= previousMonth && date < currentMonth
            })

            const currentMonthTotal = currentMonthConsumptions.reduce((sum: number, c: any) => 
                sum + (c.totalLiters || 0), 0
            )
            const previousMonthTotal = previousMonthConsumptions.reduce((sum: number, c: any) => 
                sum + (c.totalLiters || 0), 0
            )

            const consumptionTrend = previousMonthTotal > 0 
                ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100 
                : 0

            const totalConsumption = consumptions.reduce((sum: number, c: any) => 
                sum + (c.totalLiters || 0), 0
            )

            const stats: PlatformStats = {
                totalUsers: filteredUsers.length,
                activeUsers: filteredUsers.filter((u: any) => u.homeId).length,
                totalHomes: filteredHomes.length,
                activeHomes: filteredHomes.filter((h: any) => h.active).length,
                totalSensors: filteredSensors.length,
                activeSensors: filteredSensors.filter((s: any) => s.status === 'active').length,
                totalConsumption: Math.round(totalConsumption),
                totalAlerts: filteredAlerts.length,
                pendingAlerts: filteredAlerts.filter((a: any) => !a.resolved).length,
                currentMonthConsumption: Math.round(currentMonthTotal),
                previousMonthConsumption: Math.round(previousMonthTotal),
                consumptionTrend: Math.round(consumptionTrend * 10) / 10,
            }

            setPlatformStats(stats)

            // Calcular hogares que requieren atención (consumo anormal o con alertas)
            const homeConsumption = new Map<string, number>()
            consumptions.forEach((c: any) => {
                const current = homeConsumption.get(c.homeId) || 0
                homeConsumption.set(c.homeId, current + (c.totalLiters || 0))
            })

            // Contar alertas por hogar
            const homeAlerts = new Map<string, number>()
            filteredAlerts.forEach((a: any) => {
                if (!a.resolved) {
                    const current = homeAlerts.get(String(a.homeId)) || 0
                    homeAlerts.set(String(a.homeId), current + 1)
                }
            })

            const homesWithIssues: TopHome[] = Array.from(homeConsumption.entries())
                .map(([homeId, total]) => {
                    const home = filteredHomes.find((h: any) => String(h._id) === homeId)
                    const homeConsumptions = consumptions.filter((c: any) => String(c.homeId) === homeId)
                    const averageDaily = homeConsumptions.length > 0 ? total / homeConsumptions.length : 0
                    const members = home?.members || 1
                    const consumptionPerPerson = Math.round(averageDaily / members)
                    const alertCount = homeAlerts.get(homeId) || 0
                    
                    return {
                        homeId,
                        homeName: home?.name || 'Desconocido',
                        totalConsumption: Math.round(total),
                        averageDaily: Math.round(averageDaily),
                        members,
                        consumptionPerPerson,
                        alertCount,
                        status: consumptionPerPerson > 200 || alertCount > 0 ? 'critical' as const : 
                               consumptionPerPerson > 150 ? 'high' as const : 'warning' as const
                    }
                })
                // Filtrar solo hogares con consumo > 120 L/persona/día (umbral de monitoreo)
                .filter(home => home.consumptionPerPerson > 120 || (home.alertCount && home.alertCount > 0))
                // Ordenar por prioridad: primero críticos (con alertas o >200), luego por consumo
                .sort((a, b) => {
                    // Prioridad 1: Hogares con alertas
                    if ((a.alertCount || 0) > 0 && (b.alertCount || 0) === 0) return -1
                    if ((a.alertCount || 0) === 0 && (b.alertCount || 0) > 0) return 1
                    
                    // Prioridad 2: Consumo crítico (>200)
                    const aCritical = a.consumptionPerPerson > 200
                    const bCritical = b.consumptionPerPerson > 200
                    if (aCritical && !bCritical) return -1
                    if (!aCritical && bCritical) return 1
                    
                    // Prioridad 3: Mayor consumo per cápita
                    return b.consumptionPerPerson - a.consumptionPerPerson
                })
                // Limitar a los 10 más críticos para no saturar la vista
                .slice(0, 10)

            setTopHomes(homesWithIssues)

            // Calculate monthly trend (filtrado por período seleccionado)
            const monthlyData = new Map<string, number>()
            consumptions.forEach((c: any) => {
                const date = new Date(c.date)
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                const current = monthlyData.get(monthKey) || 0
                monthlyData.set(monthKey, current + (c.totalLiters || 0))
            })

            const trend: MonthlyTrend[] = Array.from(monthlyData.entries())
                .map(([date, consumption]) => ({
                    date,
                    consumption: Math.round(consumption),
                }))
                .sort((a, b) => a.date.localeCompare(b.date))
                // NO limitar a 6 meses - usar el rango seleccionado

            setMonthlyTrend(trend)

        } catch (err: any) {
            console.error('Error fetching statistics:', err)
            setError(err.message || 'Error al cargar estadísticas')
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
                    const weekBefore = last.subtract(7, 'day')
                    from = availableDates.find(d => !d.isBefore(weekBefore, 'day')) || availableDates[0]
                    break
                case 'month':
                    const monthBefore = last.subtract(1, 'month')
                    from = availableDates.find(d => !d.isBefore(monthBefore, 'day')) || availableDates[0]
                    break
                case 'quarter':
                    const quarterBefore = last.subtract(3, 'month')
                    from = availableDates.find(d => !d.isBefore(quarterBefore, 'day')) || availableDates[0]
                    break
                default:
                    const defaultBefore = last.subtract(1, 'month')
                    from = availableDates.find(d => !d.isBefore(defaultBefore, 'day')) || availableDates[0]
            }
            
            setDateFrom(from)
            setDateTo(last)
        }
    }

    const handleClearFilters = () => {
        setSelectedSector(null)
        setPeriodFilter('month')
        if (availableDates.length > 0) {
            const last = availableDates[availableDates.length - 1]
            const monthBefore = last.subtract(1, 'month')
            const from = availableDates.find(d => !d.isBefore(monthBefore, 'day')) || availableDates[0]
            setDateTo(last)
            setDateFrom(from)
        }
    }

    useEffect(() => {
        fetchStatistics()
    }, [])

    useEffect(() => {
        if (allConsumptions.length > 0 && dateFrom && dateTo) {
            fetchStatistics()
        }
    }, [dateFrom, dateTo, selectedSector])

    return {
        platformStats,
        topHomes,
        monthlyTrend,
        loading,
        error,
        refetch: fetchStatistics,
        filterByPeriod,
        currentPeriod: periodFilter,
        dateFrom,
        dateTo,
        setDateFrom,
        setDateTo,
        availableDates,
        handleClearFilters,
        sectors,
        selectedSector,
        setSelectedSector,
    }
}

export default useStatistics
