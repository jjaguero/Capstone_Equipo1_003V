import { useState, useEffect } from 'react'
import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Spinner from '@/components/ui/Spinner'
import Breadcrumb from '@/components/shared/Breadcrumb'
import useConsumption from '../hooks/useConsumption'
import { useSystemDashboard } from '@/hooks/useSystemDashboard'
import ConsumptionStats from '../components/ConsumptionStats'
import { SystemTrendsChart, AlertsTable } from '../components'
import { DistributionChart } from '@/components/consumption/DistributionChart'

interface Home {
    _id: string
    name: string
    address: string
    sectorId: string
    ownerId?: string
    active: boolean
    members: number
}

const ConsumptionPage = () => {
    const {
        stats,
        consumptions,
        loading: consumptionLoading,
        error: consumptionError,
        refetch,
    } = useConsumption()

    const {
        systemTrends,
        consumptionDistribution,
        homesWithAlerts,
        loading: dashboardLoading,
        error: dashboardError,
        refreshData,
    } = useSystemDashboard()

    const [homes, setHomes] = useState<Home[]>([])
    const [loadingHomes, setLoadingHomes] = useState(true)

    useEffect(() => {
        const fetchHomes = async () => {
            try {
                const response = await apiClient.get<Home[]>(ENDPOINTS.HOMES)
                setHomes(response.data.filter(home => home.active))
            } catch (err) {
                console.error('Error fetching homes:', err)
            } finally {
                setLoadingHomes(false)
            }
        }

        fetchHomes()
    }, [])

    const loading = consumptionLoading || dashboardLoading || loadingHomes
    const error = consumptionError || dashboardError

    if (loading) {
        return (
            <Container>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="relative">
                            <div className="w-16 h-16 mx-auto mb-4 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">
                            Cargando datos del sistema...
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                            Por favor espera un momento
                        </p>
                    </div>
                </div>
            </Container>
        )
    }

    if (error) {
        return (
            <Container>
                <AdaptiveCard className="bg-white/80 backdrop-blur-sm shadow-lg">
                    <div className="flex flex-col items-center justify-center h-64 gap-6">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <p className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
                                Error al cargar datos
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {error}
                            </p>
                        </div>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                            Reintentar
                        </button>
                    </div>
                </AdaptiveCard>
            </Container>
        )
    }

    return (
        <Container>
            <Breadcrumb />

            {/* KPIs - Estadísticas principales */}
            <div className="animate-slideUp" style={{ animationDelay: '0.1s' }}>
                {stats && (
                    <ConsumptionStats
                        totalConsumed={stats.totalConsumed}
                        averageDaily={stats.averageDaily}
                        totalAlerts={stats.totalAlerts}
                        homesCount={stats.homesCount}
                    />
                )}
            </div>

            {/* Gráficos Escalables */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8 animate-slideUp" style={{ animationDelay: '0.2s' }}>
                <SystemTrendsChart data={systemTrends} />
                <DistributionChart data={consumptionDistribution} />
            </div>

            {/* Tabla de Alertas - Solo hogares que requieren atención */}
            <div className="animate-slideUp" style={{ animationDelay: '0.3s' }}>
                <AlertsTable alerts={homesWithAlerts} />
            </div>
        </Container>
    )
}

export default ConsumptionPage
