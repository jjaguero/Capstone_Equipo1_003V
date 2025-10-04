import { FC } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Chart from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'
import { ConsumptionDistribution } from '@/hooks/useSystemDashboard'

interface ConsumptionDistributionChartProps {
    data: ConsumptionDistribution[]
}

const ConsumptionDistributionChart: FC<ConsumptionDistributionChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <AdaptiveCard className="h-96">
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 dark:text-gray-400">
                        No hay datos de distribución disponibles
                    </p>
                </div>
            </AdaptiveCard>
        )
    }

    // Preparar datos para el gráfico
    const categories = data.map(item => item.range)
    const seriesData = data.map(item => item.count)

    const chartOptions: ApexOptions = {
        chart: {
            type: 'bar',
            height: 350,
            toolbar: {
                show: false,
            },
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '60%',
                borderRadius: 8,
            },
        },
        dataLabels: {
            enabled: true,
            formatter: (value) => `${value}`,
            style: {
                fontSize: '12px',
                fontWeight: 'bold',
            },
        },
        xaxis: {
            categories,
            labels: {
                style: {
                    fontSize: '11px',
                },
                rotate: -45,
            },
        },
        yaxis: {
            title: {
                text: 'Cantidad de Hogares',
            },
            labels: {
                formatter: (value) => Math.round(value).toString(),
            },
        },
        colors: ['#10B981', '#F59E0B', '#EF4444', '#7C3AED'],
        grid: {
            borderColor: '#E5E7EB',
            strokeDashArray: 4,
        },
        tooltip: {
            y: {
                formatter: (value) => `${value} hogares`,
            },
        },
    }

    const series = [
        {
            name: 'Hogares',
            data: seriesData,
        },
    ]

    return (
        <AdaptiveCard>
            <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    📊 Distribución por Rangos de Consumo
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Consumo real vs límite establecido
                </p>
                <Chart
                    options={chartOptions}
                    series={series}
                    type="bar"
                    height={280}
                />
            </div>
        </AdaptiveCard>
    )
}

export default ConsumptionDistributionChart