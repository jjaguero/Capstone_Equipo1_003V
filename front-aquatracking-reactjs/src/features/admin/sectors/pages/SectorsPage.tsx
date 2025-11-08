import { useState } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import Breadcrumb from '@/components/shared/Breadcrumb'
import { PiFilePdfDuotone } from 'react-icons/pi'
import useSectors from '../hooks/useSectors'
import SectorCard from '../components/SectorCard'
import SectorComparisonChart from '../components/SectorComparisonChart'
import SectorDistributionChart from '../components/SectorDistributionChart'
import SectorComparison from '../components/SectorComparison'
import SectorPeriodFilter from '../components/SectorPeriodFilter'
import { ReportGenerator } from '@/utils/reportGenerator'
import { toast } from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

const SectorsPage = () => {
    const { sectors, stats, loading, error, refetch, filterByPeriod, currentPeriod } = useSectors()
    const [isGenerating, setIsGenerating] = useState(false)

    // Generar reporte PDF
    const handleGeneratePDF = async () => {
        if (!stats || stats.length === 0) {
            toast.push(
                <Notification type="warning">
                    No hay datos de sectores disponibles para generar el reporte
                </Notification>
            )
            return
        }

        setIsGenerating(true)
        try {
            const periodLabel = currentPeriod === 'week' ? 'Última Semana' : 
                               currentPeriod === 'month' ? 'Último Mes' : 
                               currentPeriod === 'quarter' ? 'Último Trimestre' : 'Todo el Período'

            const report = new ReportGenerator({
                title: 'Reporte de Sectores',
                subtitle: `Análisis de consumo por sectores - ${periodLabel}`,
                orientation: 'landscape'
            })

            // Resumen general
            report.addSection('Resumen General')
            const totalHomes = stats.reduce((sum, s) => sum + s.totalHomes, 0)
            const totalConsumption = stats.reduce((sum, s) => sum + s.totalConsumption, 0)
            const totalAlerts = stats.reduce((sum, s) => sum + s.totalAlerts, 0)
            const pendingAlerts = stats.reduce((sum, s) => sum + s.pendingAlerts, 0)
            const totalMembers = stats.reduce((sum, s) => sum + s.totalMembers, 0)

            const summaryMetrics = [
                { label: 'Total de Sectores', value: stats.length },
                { label: 'Total de Hogares', value: totalHomes },
                { label: 'Total de Miembros', value: totalMembers },
                { label: 'Consumo Total', value: totalConsumption.toLocaleString('es-CL'), unit: 'L' },
                { label: 'Promedio por Hogar', value: totalHomes > 0 ? Math.round(totalConsumption / totalHomes).toLocaleString('es-CL') : '0', unit: 'L' },
                { label: 'Alertas Totales', value: totalAlerts },
                { label: 'Alertas Pendientes', value: pendingAlerts }
            ]
            report.addMetricsGrid(summaryMetrics)
            report.checkPageBreak(80)

            // Tabla de sectores
            report.addSection('Detalle por Sector')
            const columns = [
                { header: 'Sector', dataKey: 'name' },
                { header: 'Hogares', dataKey: 'homes' },
                { header: 'Miembros', dataKey: 'members' },
                { header: 'Consumo Total (L)', dataKey: 'consumption' },
                { header: 'Promedio (L)', dataKey: 'average' },
                { header: 'L/Persona', dataKey: 'perPerson' },
                { header: 'Alertas', dataKey: 'alerts' },
                { header: 'Pendientes', dataKey: 'pending' }
            ]
            const tableData = stats.map(stat => ({
                name: stat.sectorName,
                homes: stat.totalHomes,
                members: stat.totalMembers,
                consumption: stat.totalConsumption.toLocaleString('es-CL'),
                average: stat.averageConsumption.toLocaleString('es-CL'),
                perPerson: stat.totalMembers > 0 ? Math.round(stat.totalConsumption / stat.totalMembers).toLocaleString('es-CL') : '0',
                alerts: stat.totalAlerts,
                pending: stat.pendingAlerts
            }))
            report.addTable(columns, tableData)

            // Guardar PDF
            const filename = `reporte-sectores-${currentPeriod || 'completo'}.pdf`
            report.save(filename)

            toast.push(
                <Notification type="success">
                    Reporte PDF generado exitosamente
                </Notification>
            )
        } catch (error) {
            console.error('Error generating PDF:', error)
            toast.push(
                <Notification type="danger">
                    Error al generar el reporte PDF
                </Notification>
            )
        } finally {
            setIsGenerating(false)
        }
    }

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
            <Breadcrumb />
            
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Análisis por Sectores
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Comparación de consumo de agua entre sectores
                    </p>
                </div>

                {/* Botón de exportación PDF */}
                <Button
                    variant="solid"
                    size="sm"
                    icon={<PiFilePdfDuotone />}
                    onClick={handleGeneratePDF}
                    loading={isGenerating}
                    disabled={isGenerating || stats.length === 0}
                    className="bg-red-600 hover:bg-red-700"
                >
                    Generar Reporte PDF
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
