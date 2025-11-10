import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Spinner from '@/components/ui/Spinner'
import Breadcrumb from '@/components/shared/Breadcrumb'
import useSectors from '../hooks/useSectors'
import SectorCard from '../components/SectorCard'
import SectorComparisonChart from '../components/SectorComparisonChart'
import SectorDistributionChart from '../components/SectorDistributionChart'
import SectorComparison from '../components/SectorComparison'
import SectorPeriodFilter from '../components/SectorPeriodFilter'

const SectorsPage = () => {
    const { 
        sectors, 
        stats, 
        loading, 
        error, 
        refetch, 
        filterByPeriod, 
        currentPeriod,
        dateFrom,
        dateTo,
        setDateFrom,
        setDateTo,
        availableDates,
        handleClearFilters
    } = useSectors()

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
            <div className="animate-fadeIn">
                <Breadcrumb />
            </div>

            {/* Filtros */}
            <div className="animate-slideUp" style={{ animationDelay: '0.1s' }}>
                <SectorPeriodFilter
                    currentPeriod={currentPeriod}
                    onFilterPeriod={filterByPeriod}
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    onDateFromChange={setDateFrom}
                    onDateToChange={setDateTo}
                    availableDates={availableDates}
                    onClearFilters={handleClearFilters}
                />
            </div>

            {/* Sector Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 animate-slideUp" style={{ animationDelay: '0.2s' }}>
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
            <div className="mb-6 animate-slideUp" style={{ animationDelay: '0.3s' }}>
                <SectorComparison stats={stats} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slideUp" style={{ animationDelay: '0.4s' }}>
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
