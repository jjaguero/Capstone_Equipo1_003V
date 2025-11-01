import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import { PiArrowClockwiseDuotone } from 'react-icons/pi'
import useStatistics from '../hooks/useStatistics'
import PlatformStats from '../components/PlatformStats'
import TopHomesTable from '../components/TopHomesTable'
import MonthlyTrendChart from '../components/MonthlyTrendChart'

const StatisticsPage = () => {
    const {
        platformStats,
        topHomes,
        monthlyTrend,
        loading,
        error,
        refetch,
    } = useStatistics()

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
                            Error al cargar estadísticas: {error}
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
                        Estadísticas Generales
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Métricas y reportes de toda la plataforma
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
            {platformStats && (
                <PlatformStats
                    totalUsers={platformStats.totalUsers}
                    activeUsers={platformStats.activeUsers}
                    totalHomes={platformStats.totalHomes}
                    activeHomes={platformStats.activeHomes}
                    totalSensors={platformStats.totalSensors}
                    activeSensors={platformStats.activeSensors}
                    totalConsumption={platformStats.totalConsumption}
                    totalAlerts={platformStats.totalAlerts}
                    pendingAlerts={platformStats.pendingAlerts}
                    currentMonthConsumption={platformStats.currentMonthConsumption}
                    consumptionTrend={platformStats.consumptionTrend}
                />
            )}

            {/* Tendencia mensual */}
            {monthlyTrend.length > 0 && (
                <AdaptiveCard className="mb-6">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                        Tendencia de Consumo (Últimos 6 Meses)
                    </h4>
                    <MonthlyTrendChart data={monthlyTrend} />
                </AdaptiveCard>
            )}

            {/* Top 5 hogares */}
            <TopHomesTable homes={topHomes} />
        </Container>
    )
}

export default StatisticsPage
