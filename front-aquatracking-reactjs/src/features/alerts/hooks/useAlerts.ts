import { useState, useEffect } from 'react'
import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'

interface Alert {
    _id: string
    homeId: string
    type: string
    message: string
    triggeredAt: string
    resolved: boolean
    createdAt?: string
    updatedAt?: string
}

interface AlertsStats {
    total: number
    pending: number
    resolved: number
    critical: number
    high: number
}

interface UseAlertsReturn {
    alerts: Alert[]
    stats: AlertsStats | null
    loading: boolean
    error: string | null
    refetch: () => void
    filterByHome: (homeId: string | null) => void
    filterByType: (type: string | null) => void
    filterByStatus: (resolved: boolean | null) => void
}

export const useAlerts = (homeId?: string, fetchAll = false): UseAlertsReturn => {
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([])
    const [stats, setStats] = useState<AlertsStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [homeFilter, setHomeFilter] = useState<string | null>(null)
    const [typeFilter, setTypeFilter] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState<boolean | null>(null)

    const fetchAlerts = async () => {
        try {
            setLoading(true)
            setError(null)

            let response;
            if (homeId && !fetchAll) {
                // Filtrar alertas por homeId para usuarios

                response = await apiClient.get<Alert[]>(ENDPOINTS.ALERTS_BY_HOME(homeId))
            } else if (fetchAll) {
                // Obtener todas las alertas para admin

                response = await apiClient.get<Alert[]>(ENDPOINTS.ALERTS)
            } else {
                // Sin homeId y sin fetchAll, no buscar alertas
                setAlerts([])
                setFilteredAlerts([])
                setStats({ total: 0, pending: 0, resolved: 0, critical: 0, high: 0 })
                setLoading(false)
                return
            }

            const data = response.data


            setAlerts(data)
            setFilteredAlerts(data)
            calculateStats(data)
        } catch (err: any) {
            console.error('Error fetching alerts:', err)
            setError(err.message || 'Error al cargar alertas')
        } finally {
            setLoading(false)
        }
    }

    const calculateStats = (data: Alert[]) => {
        const total = data.length
        const pending = data.filter(a => !a.resolved).length
        const resolved = data.filter(a => a.resolved).length
        const critical = data.filter(a => a.type === 'critical_consumption' && !a.resolved).length
        const high = data.filter(a => a.type === 'high_consumption' && !a.resolved).length

        setStats({
            total,
            pending,
            resolved,
            critical,
            high,
        })
    }

    const applyFilters = () => {
        let filtered = [...alerts]

        if (homeFilter) {
            filtered = filtered.filter(a => a.homeId === homeFilter)
        }

        if (typeFilter) {
            filtered = filtered.filter(a => a.type === typeFilter)
        }

        if (statusFilter !== null) {
            filtered = filtered.filter(a => a.resolved === statusFilter)
        }

        setFilteredAlerts(filtered)
        calculateStats(filtered)
    }

    const filterByHome = (homeId: string | null) => {
        setHomeFilter(homeId)
    }

    const filterByType = (type: string | null) => {
        setTypeFilter(type)
    }

    const filterByStatus = (resolved: boolean | null) => {
        setStatusFilter(resolved)
    }

    useEffect(() => {
        fetchAlerts()
    }, [homeId, fetchAll])

    useEffect(() => {
        applyFilters()
    }, [homeFilter, typeFilter, statusFilter, alerts])

    return {
        alerts: filteredAlerts,
        stats,
        loading,
        error,
        refetch: fetchAlerts,
        filterByHome,
        filterByType,
        filterByStatus,
    }
}

export default useAlerts
