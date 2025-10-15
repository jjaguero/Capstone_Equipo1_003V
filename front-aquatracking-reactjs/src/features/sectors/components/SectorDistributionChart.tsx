import Chart from '@/components/shared/Chart'
import type { ApexOptions } from 'apexcharts'

interface SectorStats {
    sectorName: string
    totalHomes: number
    totalMembers: number
}

interface SectorDistributionChartProps {
    stats: SectorStats[]
}

const SectorDistributionChart = ({ stats }: SectorDistributionChartProps) => {
    const labels = stats.map(s => s.sectorName)
    const homesData = stats.map(s => s.totalHomes)

    const options: ApexOptions = {
        chart: {
            type: 'pie',
        },
        labels,
        legend: {
            position: 'bottom',
        },
        colors: ['#3b82f6', '#8b5cf6'],
        tooltip: {
            y: {
                formatter: (value) => `${value} ${value === 1 ? 'hogar' : 'hogares'}`,
            },
        },
        dataLabels: {
            enabled: true,
            formatter: (val: number) => `${val.toFixed(1)}%`,
        },
    }

    return <Chart type="donut" customOptions={options} series={homesData} height={300} />
}

export default SectorDistributionChart
