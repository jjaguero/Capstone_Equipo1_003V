import { FC } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Badge from '@/components/ui/Badge'
import { HomeAlert } from '@/hooks/useSystemDashboard'

interface AlertsTableProps {
    alerts: HomeAlert[]
}

const AlertsTable: FC<AlertsTableProps> = ({ alerts }) => {
    if (!alerts || alerts.length === 0) {
        return (
            <AdaptiveCard className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                        Hogares que Requieren Atención
                    </h4>
                    <div className="flex items-center justify-center h-32">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                Todos los hogares funcionando normalmente
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                No hay alertas en este momento
                            </p>
                        </div>
                    </div>
                </div>
            </AdaptiveCard>
        )
    }

    const getStatusBadge = (status: 'warning' | 'critical') => {
        if (status === 'critical') {
            return (
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-3 py-1 font-medium">
                    Crítico
                </Badge>
            )
        }
        return (
            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-3 py-1 font-medium">
                Alto
            </Badge>
        )
    }

    const formatPercentage = (percentage: number) => {
        return `${Math.round(percentage)}%`
    }

    return (
        <AdaptiveCard className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Hogares que Requieren Atención ({alerts.length})
                    </h4>
                    {alerts.length > 0 && (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-3 py-1">
                            {alerts.length} alertas activas
                        </Badge>
                    )}
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Hogar
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Consumo Hoy
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Límite
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    % Usado
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {alerts.map((alert) => (
                                <tr key={alert.homeId} className="hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {alert.homeName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {Math.round(alert.consumption)}L
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {Math.round(alert.limit)}L
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`text-sm font-bold ${
                                            alert.percentageUsed >= 100 
                                                ? 'text-red-600 dark:text-red-400' 
                                                : 'text-amber-600 dark:text-amber-400'
                                        }`}>
                                            {formatPercentage(alert.percentageUsed)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(alert.status)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {alerts.length > 5 && (
                    <div className="mt-4 text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Mostrando los primeros {Math.min(5, alerts.length)} hogares con mayor urgencia
                        </p>
                    </div>
                )}
            </div>
        </AdaptiveCard>
    )
}

export default AlertsTable