import Card from '@/components/ui/Card'
import { 
    PiUsersDuotone,
    PiHouseDuotone,
    PiDropDuotone,
    PiWarningDuotone,
    PiChartLineDuotone,
    PiCircuitryDuotone
} from 'react-icons/pi'

interface PlatformStatsProps {
    totalUsers: number
    activeUsers: number
    totalHomes: number
    activeHomes: number
    totalSensors: number
    activeSensors: number
    totalConsumption: number
    totalAlerts: number
    pendingAlerts: number
    currentMonthConsumption: number
    consumptionTrend: number
}

const PlatformStats = (props: PlatformStatsProps) => {
    const stats = [
        {
            icon: <PiUsersDuotone className="text-4xl" />,
            label: 'Usuarios',
            value: props.activeUsers,
            total: props.totalUsers,
            unit: 'activos',
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            icon: <PiHouseDuotone className="text-4xl" />,
            label: 'Hogares',
            value: props.activeHomes,
            total: props.totalHomes,
            unit: 'activos',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-100',
        },
        {
            icon: <PiCircuitryDuotone className="text-4xl" />,
            label: 'Sensores',
            value: props.activeSensors,
            total: props.totalSensors,
            unit: 'activos',
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
        {
            icon: <PiDropDuotone className="text-4xl" />,
            label: 'Consumo Total',
            value: props.totalConsumption,
            unit: 'litros',
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-100',
        },
        {
            icon: <PiChartLineDuotone className="text-4xl" />,
            label: 'Consumo Mes Actual',
            value: props.currentMonthConsumption,
            unit: 'litros',
            trend: props.consumptionTrend,
            color: props.consumptionTrend > 0 ? 'text-orange-600' : 'text-green-600',
            bgColor: props.consumptionTrend > 0 ? 'bg-orange-100' : 'bg-green-100',
        },
        {
            icon: <PiWarningDuotone className="text-4xl" />,
            label: 'Alertas',
            value: props.pendingAlerts,
            total: props.totalAlerts,
            unit: 'pendientes',
            color: props.pendingAlerts > 0 ? 'text-red-600' : 'text-gray-600',
            bgColor: props.pendingAlerts > 0 ? 'bg-red-100' : 'bg-gray-100',
        },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {stat.value.toLocaleString('es-CL')}
                                </span>
                                {stat.total !== undefined && (
                                    <span className="text-sm text-gray-500">
                                        / {stat.total}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {stat.unit}
                                </span>
                                {stat.trend !== undefined && stat.trend !== 0 && (
                                    <span className={`text-xs font-medium ${
                                        stat.trend > 0 ? 'text-orange-600' : 'text-green-600'
                                    }`}>
                                        {stat.trend > 0 ? '↗' : '↘'} {Math.abs(stat.trend)}%
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}

export default PlatformStats
