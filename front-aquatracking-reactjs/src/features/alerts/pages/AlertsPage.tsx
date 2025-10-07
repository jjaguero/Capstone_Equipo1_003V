import { useState, useEffect } from 'react'
import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import { PiArrowClockwiseDuotone } from 'react-icons/pi'
import useAlerts from '../hooks/useAlerts'
import AlertsStats from '../components/AlertsStats'
import AlertsFilters from '../components/AlertsFilters'
import AlertsTable from '../components/AlertsTable'

interface Home {
    _id: string
    name: string
    address: string
    sectorId: string
    ownerId?: string
    active: boolean
    members: number
}

const AlertsPage = () => {
    // Esta página es SOLO para administradores
    const {
        alerts,
        stats,
        loading,
        error,
        refetch,
        filterByHome,
        filterByType,
        filterByStatus,
    } = useAlerts(undefined, true) // fetchAll = true para admin

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

    const handleReset = () => {
        refetch()
    }

    if (loading || loadingHomes) {
        return (
            <Container>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="relative">
                            <div className="w-16 h-16 mx-auto mb-4 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">
                            Cargando alertas del sistema...
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
                                Error al cargar alertas
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {error}
                            </p>
                        </div>
                        <Button 
                            onClick={refetch} 
                            icon={<PiArrowClockwiseDuotone />}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2"
                        >
                            Reintentar
                        </Button>
                    </div>
                </AdaptiveCard>
            </Container>
        )
    }

    return (
        <Container>
            <div className="flex items-center justify-between mb-8 animate-fadeIn">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Gestión de Alertas del Sistema
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Monitoreo de alertas de consumo excesivo de agua de todo el sistema
                    </p>
                </div>
                <Button
                    variant="solid"
                    onClick={refetch}
                    icon={<PiArrowClockwiseDuotone />}
                    className="hidden sm:flex bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
                >
                    Actualizar
                </Button>
            </div>
            <div className="animate-slideUp" style={{ animationDelay: '0.1s' }}>
            {stats && (
                <AlertsStats
                    total={stats.total}
                    pending={stats.pending}
                    resolved={stats.resolved}
                    critical={stats.critical}
                    high={stats.high}
                />
            )}
            </div>
            <div className="animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <AlertsFilters
                homes={homes}
                onFilterHome={filterByHome}
                onFilterType={filterByType}
                onFilterStatus={filterByStatus}
                onReset={handleReset}
            />
            </div>
            <div className="animate-slideUp" style={{ animationDelay: '0.3s' }}>
            <AlertsTable
                alerts={alerts}
                homes={homes}
            />
            </div>
        </Container>
    )
}

export default AlertsPage
