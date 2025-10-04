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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                            {stat.icon}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                {stat.label}
                            </p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {stat.value}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {stat.unit}
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}

export default ConsumptionStats
