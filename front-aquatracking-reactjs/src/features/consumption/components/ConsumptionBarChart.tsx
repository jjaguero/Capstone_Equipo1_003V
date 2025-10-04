import { useMemo } from 'react'
import Card from '@/components/ui/Card'
import { Chart } from '@/components/shared'
import type { ApexOptions } from 'apexcharts'

interface DailyConsumption {
    _id: string
    homeId: string
    date: string
    totalLiters: number
    limitLiters: number
    alerts: any[]
}

interface Home {
    _id: string
    name: string
}

interface ConsumptionBarChartProps {
    consumptions: DailyConsumption[]
    homes: Home[]
}

const ConsumptionBarChart = ({ consumptions, homes }: ConsumptionBarChartProps) => {
    const chartData = useMemo(() => {
        const homeConsumption = new Map<string, {
            total: number
            limit: number
            alerts: number
        }>()

        consumptions.forEach(consumption => {
            if (!homeConsumption.has(consumption.homeId)) {
                homeConsumption.set(consumption.homeId, {
                    total: 0,
                    limit: consumption.limitLiters,
                    alerts: 0,
                })
            }

            const data = homeConsumption.get(consumption.homeId)!
            data.total += consumption.totalLiters
            data.alerts += consumption.alerts.length
        })

        const sortedHomes = Array.from(homeConsumption.entries())
            .sort((a, b) => b[1].total - a[1].total)
            .map(([homeId]) => {
                const home = homes.find(h => h._id === homeId)
                return {
                    homeId,
                    name: home?.name || 'Desconocido',
                }
            })

        const consumoData = sortedHomes.map(({ homeId }) => {
            const data = homeConsumption.get(homeId)!
            return Math.round(data.total)
        })

        const limiteData = sortedHomes.map(({ homeId }) => {
            const data = homeConsumption.get(homeId)!
            const dias = consumptions.filter(c => c.homeId === homeId).length
            return Math.round(data.limit * dias)
        })

        return {
            categories: sortedHomes.map(h => h.name),
            series: [
                {
                    name: 'Consumo Real',
                    data: consumoData,
                },
                {
                    name: 'Límite Total',
                    data: limiteData,
                },
            ],
        }
    }, [consumptions, homes])

    const customOptions: ApexOptions = {
        chart: {
            type: 'bar',
            stacked: false,
        },
        xaxis: {
            categories: chartData.categories,
            labels: {
                rotate: -45,
                rotateAlways: false,
            },
        },
        yaxis: {
            title: {
                text: 'Litros',
            },
            labels: {
                formatter: (value) => `${Math.round(value)}L`,
            },
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '60%',
                borderRadius: 4,
            },
        },
        dataLabels: {
            enabled: false,
        },
        tooltip: {
            y: {
                formatter: (value) => `${Math.round(value).toLocaleString('es-CL')} litros`,
            },
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
        },
        colors: ['#3b82f6', '#ef4444'],
    }

    if (consumptions.length === 0) {
        return (
            <Card className="mb-6">
                <div className="flex items-center justify-center h-64 text-gray-500">
                    <p>No hay datos para comparar</p>
                </div>
            </Card>
        )
    }

    return (
        <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Comparativa Total por Hogar
                </h4>
                <p className="text-sm text-gray-500">
                    Consumo real vs límite establecido
                </p>
            </div>
            <Chart
                series={chartData.series}
                type="bar"
                height={350}
                customOptions={customOptions}
            />
        </Card>
    )
}

export default ConsumptionBarChart
