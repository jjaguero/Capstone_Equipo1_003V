import Chart from '@/components/shared/Chart'
import type { ApexOptions } from 'apexcharts'

interface MonthlyTrend {
    date: string
    consumption: number
}

interface MonthlyTrendChartProps {
    data: MonthlyTrend[]
}

const MonthlyTrendChart = ({ data }: MonthlyTrendChartProps) => {
    const categories = data.map(d => {
        const [year, month] = d.date.split('-')
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        return `${monthNames[parseInt(month) - 1]} ${year}`
    })

    const series = [
        {
            name: 'Consumo Mensual',
            data: data.map(d => d.consumption),
        },
    ]

    const options: ApexOptions = {
        chart: {
            type: 'area',
            toolbar: {
                show: true,
            },
            animations: {
                enabled: true,
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: 'smooth',
            width: 3,
        },
        xaxis: {
            categories,
            title: {
                text: 'Mes',
            },
        },
        yaxis: {
            title: {
                text: 'Litros',
            },
            labels: {
                formatter: (value) => `${value.toLocaleString('es-CL')} L`,
            },
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.3,
            },
        },
        tooltip: {
            y: {
                formatter: (value) => `${value.toLocaleString('es-CL')} litros`,
            },
        },
        colors: ['#0891b2'],
        grid: {
            borderColor: '#f1f1f1',
        },
    }

    return <Chart type="area" customOptions={options} series={series} height={350} />
}

export default MonthlyTrendChart
