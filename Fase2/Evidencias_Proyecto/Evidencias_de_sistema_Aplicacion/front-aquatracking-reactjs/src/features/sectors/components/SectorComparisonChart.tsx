import Chart from '@/components/shared/Chart'
import type { ApexOptions } from 'apexcharts'

interface SectorStats {
    sectorName: string
    totalConsumption: number
    averageConsumption: number
    totalHomes: number
}

interface SectorComparisonChartProps {
    stats: SectorStats[]
}

const SectorComparisonChart = ({ stats }: SectorComparisonChartProps) => {
    const categories = stats.map(s => s.sectorName)

    const series = [
        {
            name: 'Consumo Total',
            data: stats.map(s => s.totalConsumption),
        },
    ]

    const options: ApexOptions = {
        chart: {
            type: 'bar',
            toolbar: {
                show: true,
            },
            animations: {
                enabled: true,
            },
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '40%',
                borderRadius: 6,
                distributed: true,
            },
        },
        dataLabels: {
            enabled: true,
            formatter: (value: number) => `${value.toLocaleString('es-CL')} L`,
            style: {
                fontSize: '12px',
                fontWeight: 'bold',
            },
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent'],
        },
        xaxis: {
            categories,
            title: {
                text: 'Sectores',
            },
        },
        yaxis: {
            title: {
                text: 'Litros Totales',
            },
            labels: {
                formatter: (value) => `${value.toLocaleString('es-CL')} L`,
            },
        },
        fill: {
            opacity: 1,
        },
        tooltip: {
            y: {
                formatter: (value) => `${value.toLocaleString('es-CL')} litros`,
            },
        },
        colors: ['#3b82f6', '#8b5cf6'],
        legend: {
            show: false,
        },
    }

    return <Chart type="bar" customOptions={options} series={series} height={350} />
}

export default SectorComparisonChart
