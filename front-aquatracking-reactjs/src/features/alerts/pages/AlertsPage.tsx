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
    const {
        alerts,
        stats,
        loading,
        error,
        refetch,
        filterByHome,
        filterByType,
        filterByStatus,
    } = useAlerts()

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
                <div className="flex items-center justify-center h-96">
                    <Spinner size={40} />
                </div>
            </Container>
        )
    }

    if (error) {
        return (
            <Container>
                <AdaptiveCard>
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <p className="text-red-600 dark:text-red-400 text-lg">
                            Error al cargar alertas: {error}
                        </p>
                        <Button onClick={refetch} icon={<PiArrowClockwiseDuotone />}>
                            Reintentar
                        </Button>
                    </div>
                </AdaptiveCard>
            </Container>
        )
    }

    return (
        <Container>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Gestión de Alertas
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Monitoreo de alertas de consumo excesivo de agua
                    </p>
                </div>
                <Button
                    variant="solid"
                    onClick={refetch}
                    icon={<PiArrowClockwiseDuotone />}
                    className="hidden sm:flex"
                >
                    Actualizar
                </Button>
            </div>
            {stats && (
                <AlertsStats
                    total={stats.total}
                    pending={stats.pending}
                    resolved={stats.resolved}
                    critical={stats.critical}
                    high={stats.high}
                />
            )}
            <AlertsFilters
                homes={homes}
                onFilterHome={filterByHome}
                onFilterType={filterByType}
                onFilterStatus={filterByStatus}
                onReset={handleReset}
            />
            <AlertsTable
                alerts={alerts}
                homes={homes}
            />
        </Container>
    )
}

export default AlertsPage
