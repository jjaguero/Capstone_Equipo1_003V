import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import { PiArrowClockwiseDuotone } from 'react-icons/pi'
import useSectors from '../hooks/useSectors'
import SectorCard from '../components/SectorCard'
import SectorComparisonChart from '../components/SectorComparisonChart'
import SectorDistributionChart from '../components/SectorDistributionChart'
import SectorComparison from '../components/SectorComparison'
import SectorPeriodFilter from '../components/SectorPeriodFilter'

const SectorsPage = () => {
    const { sectors, stats, loading, error, refetch, filterByPeriod, currentPeriod } = useSectors()

    if (loading) {
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
                            Error al cargar sectores: {error}
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
                        Análisis por Sectores
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Comparación de consumo de agua entre sectores
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

            {/* Period Filter */}
            <SectorPeriodFilter
                currentPeriod={currentPeriod}
                onFilterPeriod={filterByPeriod}
            />

            {/* Sector Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {stats.map((stat) => (
                    <SectorCard
                        key={stat.sectorId}
                        sectorName={stat.sectorName}
                        totalHomes={stat.totalHomes}
                        totalConsumption={stat.totalConsumption}
                        averageConsumption={stat.averageConsumption}
                        totalAlerts={stat.totalAlerts}
                        pendingAlerts={stat.pendingAlerts}
                        totalMembers={stat.totalMembers}
                    />
                ))}
            </div>

            {/* Comparison Section */}
            <div className="mb-6">
                <SectorComparison stats={stats} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Consumption Comparison Chart */}
                <AdaptiveCard>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                        Comparación de Consumo
                    </h4>
                    <SectorComparisonChart stats={stats} />
                </AdaptiveCard>

                {/* Distribution Chart */}
                <AdaptiveCard>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                        Distribución de Hogares
                    </h4>
                    <SectorDistributionChart stats={stats} />
                </AdaptiveCard>
            </div>
        </Container>
    )
}

export default SectorsPage
