import { useState } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import Breadcrumb from '@/components/shared/Breadcrumb'
import { PiFilePdfDuotone, PiCalendarDuotone } from 'react-icons/pi'
import useStatistics from '../hooks/useStatistics'
import PlatformStats from '../components/PlatformStats'
import TopHomesTable from '../components/TopHomesTable'
import MonthlyTrendChart from '../components/MonthlyTrendChart'
import { ReportGenerator } from '@/utils/reportGenerator'
import { toast } from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import MuiDateCalendarInput from '@/components/shared/MuiDateCalendarInput'
import Card from '@/components/ui/Card'

const StatisticsPage = () => {
    const {
        platformStats,
        topHomes,
        monthlyTrend,
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
        handleClearFilters,
        sectors,
        selectedSector,
        setSelectedSector,
    } = useStatistics()

    const [isGenerating, setIsGenerating] = useState(false)

    // Generar reporte PDF
    const handleGeneratePDF = async () => {
        if (!platformStats || !topHomes || !monthlyTrend) {
            toast.push(
                <Notification type="warning">
                    No hay datos disponibles para generar el reporte
                </Notification>
            )
            return
        }

        setIsGenerating(true)
        try {
            // Formato de fechas para el subtitle
            const dateRange = dateFrom && dateTo
                ? `Del ${dateFrom.format('DD/MM/YYYY')} al ${dateTo.format('DD/MM/YYYY')}`
                : 'Período completo'
            
            const sectorInfo = selectedSector
                ? ` - Sector: ${sectors.find(s => s._id === selectedSector)?.name || 'Desconocido'}`
                : ' - Todos los sectores'

            const report = new ReportGenerator({
                title: 'Reporte de Estadísticas Generales',
                subtitle: `Resumen completo del sistema AquaTracking - ${dateRange}${sectorInfo}`
            })

            // Sección: Estadísticas de la Plataforma
            report.addSection('Estadísticas de la Plataforma')
            const platformMetrics = [
                { label: 'Usuarios Totales', value: platformStats.totalUsers },
                { label: 'Usuarios Activos', value: platformStats.activeUsers },
                { label: 'Hogares Totales', value: platformStats.totalHomes },
                { label: 'Hogares Activos', value: platformStats.activeHomes },
                { label: 'Sensores Totales', value: platformStats.totalSensors },
                { label: 'Sensores Activos', value: platformStats.activeSensors },
                { label: 'Consumo Total', value: platformStats.totalConsumption.toLocaleString('es-CL'), unit: 'L' },
                { label: 'Alertas Totales', value: platformStats.totalAlerts },
                { label: 'Alertas Pendientes', value: platformStats.pendingAlerts },
                { label: 'Consumo Mes Actual', value: platformStats.currentMonthConsumption.toLocaleString('es-CL'), unit: 'L' },
                { label: 'Tendencia', value: `${platformStats.consumptionTrend >= 0 ? '+' : ''}${platformStats.consumptionTrend.toFixed(1)}%` }
            ]
            report.addMetricsGrid(platformMetrics)
            report.checkPageBreak(60)

            // Sección: Hogares que Requieren Atención
            if (topHomes.length > 0) {
                report.addSection('Hogares que Requieren Atención')
                report.addText('Hogares con consumo anormal (>120 L/persona/día) o alertas activas que requieren seguimiento.')
                report.addSpacer(5)
                
                const columns = [
                    { header: 'Hogar', dataKey: 'name' },
                    { header: 'Consumo Promedio (L/día)', dataKey: 'avgDaily' },
                    { header: 'Miembros', dataKey: 'members' },
                    { header: 'L/Persona/Día', dataKey: 'perPerson' },
                    { header: 'Alertas', dataKey: 'alerts' },
                    { header: 'Estado', dataKey: 'status' },
                    { header: 'Recomendación', dataKey: 'recommendation' }
                ]
                const topHomesData = topHomes.map((home) => {
                    const getRecommendation = (consumptionPerPerson: number) => {
                        if (consumptionPerPerson > 200) return 'Revisar fugas o uso excesivo'
                        if (consumptionPerPerson > 150) return 'Optimizar hábitos de consumo'
                        if (consumptionPerPerson > 120) return 'Mantener monitoreo'
                        return 'Normal'
                    }
                    
                    const getStatus = (consumptionPerPerson: number, alertCount: number) => {
                        if (consumptionPerPerson > 200 || alertCount > 0) return 'Crítico'
                        if (consumptionPerPerson > 150) return 'Alto'
                        return 'Monitorear'
                    }
                    
                    return {
                        name: home.homeName,
                        avgDaily: home.averageDaily.toLocaleString('es-CL'),
                        members: home.members,
                        perPerson: home.consumptionPerPerson.toLocaleString('es-CL'),
                        alerts: home.alertCount || 0,
                        status: getStatus(home.consumptionPerPerson, home.alertCount || 0),
                        recommendation: getRecommendation(home.consumptionPerPerson)
                    }
                })
                report.addTable(columns, topHomesData)
            } else {
                report.addSection('Hogares que Requieren Atención')
                report.addText('✓ Excelente: No hay hogares con consumo anormal. Todos están dentro de los rangos esperados.')
            }

            // Sección: Tendencia Mensual
            if (monthlyTrend.length > 0) {
                report.checkPageBreak(60)
                report.addSection('Consumo por Mes (Últimos 6 Meses)')
                const columns = [
                    { header: 'Mes', dataKey: 'month' },
                    { header: 'Consumo (L)', dataKey: 'consumption' }
                ]
                const trendData = monthlyTrend.map(item => {
                    const [year, month] = item.date.split('-')
                    const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('es-CL', { 
                        month: 'long', 
                        year: 'numeric' 
                    })
                    return {
                        month: monthName,
                        consumption: item.consumption.toLocaleString('es-CL')
                    }
                })
                report.addTable(columns, trendData)
            }

            // Guardar PDF
            report.save('reporte-estadisticas-generales.pdf')

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
                            Error al cargar estadísticas: {error}
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
            
            {/* Filtros de período */}
            <div className="animate-slideUp" style={{ animationDelay: '0.1s' }}>
                <Card className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Selector de sector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Sector
                        </label>
                        <select
                            value={selectedSector || ''}
                            onChange={(e) => setSelectedSector(e.target.value || null)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200"
                        >
                            <option value="">Todos los sectores</option>
                            {sectors.map((sector) => (
                                <option key={sector._id} value={sector._id}>
                                    {sector.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Selector de período */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Período
                        </label>
                        <select
                            value={currentPeriod || ''}
                            onChange={(e) => {
                                const value = e.target.value as 'week' | 'month' | 'quarter' | ''
                                if (value) {
                                    filterByPeriod(value)
                                }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200"
                        >
                            <option value="">Personalizado</option>
                            <option value="week">Semanal (7 días)</option>
                            <option value="month">Mensual (30 días)</option>
                            <option value="quarter">Anual (90 días)</option>
                        </select>
                    </div>

                    {/* Fecha desde */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <PiCalendarDuotone className="inline mr-1" />
                            Desde
                        </label>
                        <MuiDateCalendarInput
                            value={dateFrom}
                            onChange={(newValue) => setDateFrom(newValue)}
                            availableDates={availableDates}
                        />
                    </div>

                    {/* Fecha hasta */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <PiCalendarDuotone className="inline mr-1" />
                            Hasta
                        </label>
                        <MuiDateCalendarInput
                            value={dateTo}
                            onChange={(newValue) => setDateTo(newValue)}
                            availableDates={availableDates}
                        />
                    </div>

                    {/* Botón limpiar filtros */}
                    <div className="flex items-end">
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleClearFilters}
                            className="w-full"
                        >
                            Limpiar filtros
                        </Button>
                    </div>
                </div>
            </Card>
            </div>

            {/* Header */}
            <div className="mb-6 flex items-center justify-end animate-slideUp" style={{ animationDelay: '0.2s' }}>
                {/* Botón de exportación PDF */}
                <Button
                    variant="solid"
                    size="sm"
                    icon={<PiFilePdfDuotone />}
                    onClick={handleGeneratePDF}
                    loading={isGenerating}
                    disabled={isGenerating || !platformStats}
                    className="bg-red-600 hover:bg-red-700"
                >
                    Generar Reporte PDF
                </Button>
            </div>

            {/* KPIs - Estadísticas principales */}
            <div className="animate-slideUp" style={{ animationDelay: '0.3s' }}>
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
            </div>

            {/* Tendencia mensual */}
            <div className="animate-slideUp" style={{ animationDelay: '0.4s' }}>
            {monthlyTrend.length > 0 && (
                <AdaptiveCard className="mb-6">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                        Tendencia de Consumo (Últimos 6 Meses)
                    </h4>
                    <MonthlyTrendChart data={monthlyTrend} />
                </AdaptiveCard>
            )}
            </div>

            {/* Top 5 hogares */}
            <div className="animate-slideUp" style={{ animationDelay: '0.5s' }}>
            <TopHomesTable homes={topHomes} />
            </div>
        </Container>
    )
}

export default StatisticsPage
