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
}

interface Home {
    _id: string
    name: string
}

interface ConsumptionLineChartProps {
    consumptions: DailyConsumption[]
    homes: Home[]
}

const ConsumptionLineChart = ({ consumptions, homes }: ConsumptionLineChartProps) => {
    const chartData = useMemo(() => {
        // Agrupar consumos por fecha
        const dateMap = new Map<string, Map<string, number>>()
        
        consumptions.forEach(consumption => {
            const date = new Date(consumption.date).toLocaleDateString('es-CL', {
                day: '2-digit',
                month: 'short',
            })
            
            if (!dateMap.has(date)) {
                dateMap.set(date, new Map())
            }
            
            const homeData = dateMap.get(date)!
            homeData.set(consumption.homeId, consumption.totalLiters)
        })

        // Ordenar fechas
        const sortedDates = Array.from(dateMap.keys()).sort((a, b) => {
            const dateA = new Date(a)
            const dateB = new Date(b)
            return dateA.getTime() - dateB.getTime()
        })

        // Crear series por home
        const series = homes.map(home => {
            return {
                name: home.name,
                data: sortedDates.map(date => {
                    const homeData = dateMap.get(date)
                    return homeData?.get(home._id) || 0
                }),
            }
        })

        return {
            categories: sortedDates,
            series,
        }
    }, [consumptions, homes])

    const customOptions: ApexOptions = {
        xaxis: {
            categories: chartData.categories,
            labels: {
                rotate: -45,
                rotateAlways: false,
            },
        },
        yaxis: {
            title: {
                text: 'Consumo (Litros)',
            },
            labels: {
                formatter: (value) => `${Math.round(value)}L`,
            },
        },
        tooltip: {
            y: {
                formatter: (value) => `${Math.round(value)} litros`,
            },
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
        },
        stroke: {
            width: 3,
            curve: 'smooth',
        },
        markers: {
            size: 4,
            hover: {
                size: 6,
            },
        },
    }

    if (consumptions.length === 0) {
        return (
            <Card className="mb-6">
                <div className="flex items-center justify-center h-64 text-gray-500">
                    <p>No hay datos de consumo para mostrar</p>
                </div>
            </Card>
        )
    }

    return (
        <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Consumo Diario por Hogar
                </h4>
            </div>
            <Chart
                series={chartData.series}
                type="line"
                height={400}
                customOptions={customOptions}
            />
        </Card>
    )
}

export default ConsumptionLineChart
