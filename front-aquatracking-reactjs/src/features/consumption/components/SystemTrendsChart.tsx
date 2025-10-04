import { FC } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Chart from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'
import { SystemTrend } from '@/hooks/useSystemDashboard'

interface SystemTrendsChartProps {
    data: SystemTrend[]
}

const SystemTrendsChart: FC<SystemTrendsChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <AdaptiveCard className="h-96">
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 dark:text-gray-400">
                        No hay datos de tendencias disponibles
                    </p>
                </div>
            </AdaptiveCard>
        )
    }

    // Preparar datos para el gráfico
    const categories = data.map(item => {
        const date = new Date(item.date)
        return date.toLocaleDateString('es-CL', { 
            month: 'short', 
            day: 'numeric' 
        })
    })

    const totalConsumptionSeries = data.map(item => Math.round(item.totalConsumption))
    const averageConsumptionSeries = data.map(item => Math.round(item.averagePerHome))

    const chartOptions: ApexOptions = {
        chart: {
            type: 'line',
            height: 350,
            toolbar: {
                show: false,
            },
            animations: {
                enabled: true,
                speed: 800,
            },
        },
        stroke: {
            curve: 'smooth',
            width: 4,
        },
        xaxis: {
            categories,
            labels: {
                style: {
                    fontSize: '12px',
                    colors: '#6B7280',
                },
            },
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },
        yaxis: {
            title: {
                text: 'Litros',
                style: {
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#6B7280',
                },
            },
            labels: {
                formatter: (value) => `${value}L`,
                style: {
                    fontSize: '12px',
                    colors: '#6B7280',
                },
            },
        },
        colors: ['#6366F1', '#10B981'],
        legend: {
            position: 'top',
            fontSize: '14px',
            fontWeight: 500,
        },
        grid: {
            borderColor: '#F3F4F6',
            strokeDashArray: 3,
            xaxis: {
                lines: {
                    show: false,
                },
            },
        },
        tooltip: {
            shared: true,
            intersect: false,
            theme: 'light',
            style: {
                fontSize: '12px',
            },
            y: {
                formatter: (value) => `${value} litros`,
            },
        },
        dataLabels: {
            enabled: false,
        },
    }

    const series = [
        {
            name: 'Consumo Total Sistema',
            data: totalConsumptionSeries,
        },
        {
            name: 'Promedio por Hogar',
            data: averageConsumptionSeries,
        },
    ]

    return (
        <AdaptiveCard className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <div className="p-6">
                <div className="mb-6">
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Tendencia del Sistema
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Consumo agregado de los últimos 30 días
                    </p>
                </div>
                <Chart
                    options={chartOptions}
                    series={series}
                    type="line"
                    height={320}
                />
            </div>
        </AdaptiveCard>
    )
}

export default SystemTrendsChart