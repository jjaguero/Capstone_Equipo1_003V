import Card from '@/components/ui/Card'
import { 
    PiBellRingingDuotone, 
    PiWarningCircleDuotone, 
    PiCheckCircleDuotone,
    PiFireDuotone 
} from 'react-icons/pi'

interface AlertsStatsProps {
    total: number
    pending: number
    resolved: number
    critical: number
    high: number
}

const AlertsStats = ({ total, pending, resolved, critical, high }: AlertsStatsProps) => {
    const stats = [
        {
            icon: <PiBellRingingDuotone className="text-4xl" />,
            label: 'Total de Alertas',
            value: total,
            unit: total === 1 ? 'alerta' : 'alertas',
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            icon: <PiWarningCircleDuotone className="text-4xl" />,
            label: 'Alertas Pendientes',
            value: pending,
            unit: pending === 1 ? 'pendiente' : 'pendientes',
            color: pending > 0 ? 'text-orange-600' : 'text-gray-600',
            bgColor: pending > 0 ? 'bg-orange-100' : 'bg-gray-100',
        },
        {
            icon: <PiCheckCircleDuotone className="text-4xl" />,
            label: 'Alertas Resueltas',
            value: resolved,
            unit: resolved === 1 ? 'resuelta' : 'resueltas',
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            icon: <PiFireDuotone className="text-4xl" />,
            label: 'Alertas Críticas',
            value: critical,
            unit: critical === 1 ? 'crítica' : 'críticas',
            color: critical > 0 ? 'text-red-600' : 'text-gray-600',
            bgColor: critical > 0 ? 'bg-red-100' : 'bg-gray-100',
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

export default AlertsStats
