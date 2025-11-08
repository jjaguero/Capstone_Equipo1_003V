import { useState, useEffect } from 'react'
import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'

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

interface UseStatisticsReturn {
    platformStats: PlatformStats | null
    topHomes: TopHome[]
    monthlyTrend: MonthlyTrend[]
    loading: boolean
    error: string | null
    refetch: () => void
}

export const useStatistics = (): UseStatisticsReturn => {
    const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
    const [topHomes, setTopHomes] = useState<TopHome[]>([])
    const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchStatistics = async () => {
        try {
            setLoading(true)
            setError(null)

            // Fetch all data
            const [usersRes, homesRes, sensorsRes, consumptionRes, alertsRes] = await Promise.all([
                apiClient.get(ENDPOINTS.USERS),
                apiClient.get(ENDPOINTS.HOMES),
                apiClient.get(ENDPOINTS.SENSORS),
                apiClient.get(ENDPOINTS.DAILY_CONSUMPTION),
                apiClient.get(ENDPOINTS.ALERTS),
            ])

            const users = usersRes.data
            const homes = homesRes.data
            const sensors = sensorsRes.data
            const consumptions = consumptionRes.data
            const alerts = alertsRes.data

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
                totalUsers: users.length,
                activeUsers: users.filter((u: any) => u.homeId).length, // Usuarios con hogar asignado
                totalHomes: homes.length,
                activeHomes: homes.filter((h: any) => h.active).length,
                totalSensors: sensors.length,
                activeSensors: sensors.filter((s: any) => s.status === 'active').length, // Sensores con status 'active'
                totalConsumption: Math.round(totalConsumption),
                totalAlerts: alerts.length,
                pendingAlerts: alerts.filter((a: any) => !a.resolved).length,
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
            alerts.forEach((a: any) => {
                if (!a.resolved) {
                    const current = homeAlerts.get(String(a.homeId)) || 0
                    homeAlerts.set(String(a.homeId), current + 1)
                }
            })

            const homesWithIssues: TopHome[] = Array.from(homeConsumption.entries())
                .map(([homeId, total]) => {
                    const home = homes.find((h: any) => String(h._id) === homeId)
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

            // Calculate monthly trend (last 6 months)
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
                .slice(-6) // últimos 6 meses

            setMonthlyTrend(trend)

        } catch (err: any) {
            console.error('Error fetching statistics:', err)
            setError(err.message || 'Error al cargar estadísticas')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStatistics()
    }, [])

    return {
        platformStats,
        topHomes,
        monthlyTrend,
        loading,
        error,
        refetch: fetchStatistics,
    }
}

export default useStatistics
