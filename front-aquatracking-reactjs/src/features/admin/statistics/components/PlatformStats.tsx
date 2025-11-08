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
    // Calcular porcentajes
    const userActivePercent = props.totalUsers > 0 ? Math.round((props.activeUsers / props.totalUsers) * 100) : 0
    const homeActivePercent = props.totalHomes > 0 ? Math.round((props.activeHomes / props.totalHomes) * 100) : 0
    const sensorActivePercent = props.totalSensors > 0 ? Math.round((props.activeSensors / props.totalSensors) * 100) : 0
    const alertResolvedPercent = props.totalAlerts > 0 ? Math.round(((props.totalAlerts - props.pendingAlerts) / props.totalAlerts) * 100) : 100

    const stats = [
        {
            icon: <PiUsersDuotone className="text-4xl" />,
            label: 'Usuarios',
            value: props.activeUsers,
            total: props.totalUsers,
            unit: 'con hogar asignado',
            percent: userActivePercent,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        },
        {
            icon: <PiHouseDuotone className="text-4xl" />,
            label: 'Hogares',
            value: props.activeHomes,
            total: props.totalHomes,
            unit: 'activos',
            percent: homeActivePercent,
            color: 'text-indigo-600 dark:text-indigo-400',
            bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
        },
        {
            icon: <PiCircuitryDuotone className="text-4xl" />,
            label: 'Sensores',
            value: props.activeSensors,
            total: props.totalSensors,
            unit: 'operativos',
            percent: sensorActivePercent,
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        },
        {
            icon: <PiDropDuotone className="text-4xl" />,
            label: 'Consumo Total',
            value: props.totalConsumption,
            unit: 'litros históricos',
            color: 'text-cyan-600 dark:text-cyan-400',
            bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
        },
        {
            icon: <PiChartLineDuotone className="text-4xl" />,
            label: 'Consumo Mes Actual',
            value: props.currentMonthConsumption,
            unit: 'litros',
            trend: props.consumptionTrend,
            color: props.consumptionTrend > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400',
            bgColor: props.consumptionTrend > 0 ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-green-100 dark:bg-green-900/30',
        },
        {
            icon: <PiWarningDuotone className="text-4xl" />,
            label: 'Alertas',
            value: props.pendingAlerts,
            total: props.totalAlerts,
            unit: 'pendientes',
            percent: 100 - alertResolvedPercent, // % pendientes
            color: props.pendingAlerts > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400',
            bgColor: props.pendingAlerts > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30',
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
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        / {stat.total}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {stat.unit}
                                </span>
                                {stat.percent !== undefined && (
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                        stat.percent >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                        stat.percent >= 50 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                        {stat.percent}%
                                    </span>
                                )}
                                {stat.trend !== undefined && stat.trend !== 0 && (
                                    <span className={`text-xs font-medium ${
                                        stat.trend > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
                                    }`}>
                                        {stat.trend > 0 ? '+' : ''}{stat.trend}%
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
