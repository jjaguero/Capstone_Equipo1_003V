import { useState, useEffect } from 'react'
import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import { PiArrowClockwiseDuotone } from 'react-icons/pi'
import useConsumption from '../hooks/useConsumption'
import ConsumptionStats from '../components/ConsumptionStats'
import ConsumptionFilters from '../components/ConsumptionFilters'
import ConsumptionLineChart from '../components/ConsumptionLineChart'
import ConsumptionBarChart from '../components/ConsumptionBarChart'
import ConsumptionTable from '../components/ConsumptionTable'

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
        consumptions,
        stats,
        loading,
        error,
        refetch,
        filterByHome,
        filterByDateRange,
        filterByPeriod,
        currentPeriod,
    } = useConsumption()

    const [homes, setHomes] = useState<Home[]>([])
    const [loadingHomes, setLoadingHomes] = useState(true)

    // Cargar lista de homes
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
                            Error al cargar datos: {error}
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
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        💧 Vista de Consumo
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Monitoreo y análisis del consumo de agua por hogar
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

            {/* KPIs - Estadísticas principales */}
            {stats && (
                <ConsumptionStats
                    totalConsumed={stats.totalConsumed}
                    averageDaily={stats.averageDaily}
                    totalAlerts={stats.totalAlerts}
                    homesCount={stats.homesCount}
                />
            )}

            {/* Filtros */}
            <ConsumptionFilters
                homes={homes}
                onFilterHome={filterByHome}
                onFilterDateRange={filterByDateRange}
                onFilterPeriod={filterByPeriod}
                currentPeriod={currentPeriod}
                onReset={handleReset}
            />

            {/* Gráficos */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                <ConsumptionLineChart consumptions={consumptions} homes={homes} />
                <ConsumptionBarChart consumptions={consumptions} homes={homes} />
            </div>

            {/* Tabla detallada */}
            <ConsumptionTable consumptions={consumptions} homes={homes} />
        </Container>
    )
}

export default ConsumptionPage
