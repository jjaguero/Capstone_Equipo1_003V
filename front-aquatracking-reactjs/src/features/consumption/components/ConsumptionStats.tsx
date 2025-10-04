import Card from '@/components/ui/Card'
import { PiDropDuotone, PiChartBarDuotone, PiWarningCircleDuotone, PiHouseDuotone } from 'react-icons/pi'

interface ConsumptionStatsProps {
    totalConsumed: number
    averageDaily: number
    totalAlerts: number
    homesCount: number
}

const ConsumptionStats = ({ totalConsumed, averageDaily, totalAlerts, homesCount }: ConsumptionStatsProps) => {
    const stats = [
        {
            icon: <PiDropDuotone className="text-4xl" />,
            label: 'Consumo Total',
            value: totalConsumed.toLocaleString('es-CL'),
            unit: 'L',
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            icon: <PiChartBarDuotone className="text-4xl" />,
            label: 'Promedio Diario',
            value: averageDaily.toLocaleString('es-CL'),
            unit: 'L/día',
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            icon: <PiWarningCircleDuotone className="text-4xl" />,
            label: 'Alertas Generadas',
            value: totalAlerts,
            unit: totalAlerts === 1 ? 'alerta' : 'alertas',
            color: totalAlerts > 0 ? 'text-red-600' : 'text-gray-600',
            bgColor: totalAlerts > 0 ? 'bg-red-100' : 'bg-gray-100',
        },
        {
            icon: <PiHouseDuotone className="text-4xl" />,
            label: 'Hogares Activos',
            value: homesCount,
            unit: homesCount === 1 ? 'hogar' : 'hogares',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-100',
        },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
                <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                    {stat.label}
                                </p>
                                <div className="flex items-baseline space-x-2">
                                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                        {stat.value}
                                    </span>
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        {stat.unit}
                                    </span>
                                </div>
                            </div>
                            <div className={`p-4 rounded-xl ${stat.bgColor} dark:bg-opacity-20`}>
                                <div className={stat.color}>
                                    {stat.icon}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}

export default ConsumptionStats
