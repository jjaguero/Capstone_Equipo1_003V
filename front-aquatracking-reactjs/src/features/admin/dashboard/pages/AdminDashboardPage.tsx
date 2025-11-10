import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import Container from '@/components/shared/Container'
import Breadcrumb from '@/components/shared/Breadcrumb'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Table from '@/components/ui/Table'
import Progress from '@/components/ui/Progress'
import Skeleton from '@/components/ui/Skeleton'
import {
    PiUsersDuotone,
    PiHouseDuotone,
    PiDropDuotone,
    PiWarningDuotone,
    PiCheckCircleDuotone,
    PiUserPlusDuotone,
    PiPlusDuotone,
    PiChartBarDuotone,
    PiClockDuotone,
} from 'react-icons/pi'
import type { User, Home, Sensor, Alert } from '@/@types/entities'

const { Tr, Td, THead, TBody, Th } = Table

interface SystemMetrics {
    totalUsers: number
    activeUsers: number
    totalHomes: number
    activeHomes: number
    totalSensors: number
    activeSensors: number
    totalAlerts: number
    criticalAlerts: number
}

interface RecentActivity {
    type: 'user' | 'home' | 'alert'
    title: string
    description: string
    timestamp: string
    icon: React.ReactNode
}

const AdminDashboardPage = () => {
    const navigate = useNavigate()
    const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
    const [criticalAlerts, setCriticalAlerts] = useState<Alert[]>([])
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)

            // Fetch all data in parallel
            const [usersRes, homesRes, sensorsRes, alertsRes] = await Promise.all([
                apiClient.get<User[]>(ENDPOINTS.USERS),
                apiClient.get<Home[]>(ENDPOINTS.HOMES),
                apiClient.get<Sensor[]>(ENDPOINTS.SENSORS),
                apiClient.get<Alert[]>(ENDPOINTS.ALERTS),
            ])

            const users = usersRes.data
            const homes = homesRes.data
            const sensors = sensorsRes.data
            const alerts = alertsRes.data

            // Calculate metrics
            const activeUsers = users.filter((u) => u.role === 'user').length
            const activeHomes = homes.filter((h) => h.active).length
            const activeSensors = sensors.filter((s) => s.status === 'active').length
            const unresolvedAlerts = alerts.filter((a) => !a.resolved)
            const critical = unresolvedAlerts.filter((a) => a.type === 'critical')

            setMetrics({
                totalUsers: users.length,
                activeUsers,
                totalHomes: homes.length,
                activeHomes,
                totalSensors: sensors.length,
                activeSensors,
                totalAlerts: unresolvedAlerts.length,
                criticalAlerts: critical.length,
            })

            // Get top 5 critical alerts
            setCriticalAlerts(
                unresolvedAlerts
                    .sort(
                        (a, b) =>
                            new Date(b.triggeredAt).getTime() -
                            new Date(a.triggeredAt).getTime()
                    )
                    .slice(0, 5)
            )

            // Generate recent activities
            const activities: RecentActivity[] = []

            // Recent alerts (last 6)
            const recentAlerts = unresolvedAlerts.slice(0, 6)
            recentAlerts.forEach((alert) => {
                const home = homes.find((h) => h._id === alert.homeId)
                activities.push({
                    type: 'alert',
                    title: 'Nueva alerta generada',
                    description: `${home?.name || 'Hogar'} - ${alert.message}`,
                    timestamp: typeof alert.triggeredAt === 'string' ? alert.triggeredAt : alert.triggeredAt.toISOString(),
                    icon: (
                        <PiWarningDuotone className="text-red-500 text-xl" />
                    ),
                })
            })

            // Sort by timestamp
            activities.sort(
                (a, b) =>
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )

            setRecentActivities(activities.slice(0, 6))
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date()
        const past = new Date(timestamp)
        const diffMs = now.getTime() - past.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 60) return `Hace ${diffMins} min`
        if (diffHours < 24) return `Hace ${diffHours}h`
        return `Hace ${diffDays}d`
    }

    if (loading) {
        return (
            <Container>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i}>
                                <div className="p-6">
                                    <Skeleton height="80px" />
                                </div>
                            </Card>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2">
                            <div className="p-6">
                                <Skeleton height="300px" />
                            </div>
                        </Card>
                        <Card>
                            <div className="p-6">
                                <Skeleton height="300px" />
                            </div>
                        </Card>
                    </div>
                </div>
            </Container>
        )
    }

    return (
        <Container>
            <div className="animate-fadeIn">
                <Breadcrumb />
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                {/* Usuarios */}
                <Card className="hover:shadow-lg transition-shadow">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                <PiUsersDuotone className="text-2xl text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                {metrics?.activeUsers} activos
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                {metrics?.totalUsers}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Total Usuarios
                            </p>
                        </div>
                        <Button
                            size="sm"
                            variant="plain"
                            className="mt-4 w-full"
                            onClick={() => navigate('/admin/users')}
                        >
                            Ver Usuarios
                        </Button>
                    </div>
                </Card>

                {/* Hogares */}
                <Card className="hover:shadow-lg transition-shadow">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                <PiHouseDuotone className="text-2xl text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                {metrics?.activeHomes} activos
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                {metrics?.totalHomes}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Total Hogares
                            </p>
                        </div>
                        <Button
                            size="sm"
                            variant="plain"
                            className="mt-4 w-full"
                            onClick={() => navigate('/admin/homes')}
                        >
                            Ver Hogares
                        </Button>
                    </div>
                </Card>

                {/* Sensores */}
                <Card className="hover:shadow-lg transition-shadow">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                <PiDropDuotone className="text-2xl text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                {metrics?.activeSensors} online
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                {metrics?.totalSensors}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Total Sensores
                            </p>
                        </div>
                        <Button
                            size="sm"
                            variant="plain"
                            className="mt-4 w-full"
                            onClick={() => navigate('/admin/sensors')}
                        >
                            Ver Sensores
                        </Button>
                    </div>
                </Card>

                {/* Alertas */}
                <Card className="hover:shadow-lg transition-shadow">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${
                                (metrics?.criticalAlerts || 0) > 0
                                    ? 'bg-red-100 dark:bg-red-900/30'
                                    : 'bg-green-100 dark:bg-green-900/30'
                            }`}>
                                {(metrics?.criticalAlerts || 0) > 0 ? (
                                    <PiWarningDuotone className="text-2xl text-red-600 dark:text-red-400" />
                                ) : (
                                    <PiCheckCircleDuotone className="text-2xl text-green-600 dark:text-green-400" />
                                )}
                            </div>
                            {(metrics?.criticalAlerts || 0) > 0 && (
                                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                    {metrics?.criticalAlerts} críticas
                                </Badge>
                            )}
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                {metrics?.totalAlerts}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Alertas Activas
                            </p>
                        </div>
                        <Button
                            size="sm"
                            variant="plain"
                            className="mt-4 w-full"
                            onClick={() => navigate('/admin/alerts')}
                        >
                            Ver Alertas
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slideUp" style={{ animationDelay: '0.2s' }}>
                {/* Alertas Críticas - 2/3 width */}
                <Card className="lg:col-span-2">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <PiWarningDuotone className="text-xl text-gray-600 dark:text-gray-400" />
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Alertas Críticas
                                </h4>
                            </div>
                            {criticalAlerts.length > 0 && (
                                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                    {criticalAlerts.length}
                                </Badge>
                            )}
                        </div>

                        {criticalAlerts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                                    <PiCheckCircleDuotone className="text-4xl text-green-600 dark:text-green-400" />
                                </div>
                                <p className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
                                    No hay alertas críticas
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Todos los hogares funcionando normalmente
                                </p>
                            </div>
                        ) : (
                            <>
                                <Table hoverable>
                                    <THead>
                                        <Tr>
                                            <Th>Mensaje</Th>
                                            <Th>Tiempo</Th>
                                        </Tr>
                                    </THead>
                                    <TBody>
                                        {criticalAlerts.map((alert) => (
                                            <Tr key={alert._id}>
                                                <Td>
                                                    <div className="flex items-start gap-2">
                                                        <PiWarningDuotone className="text-lg text-red-500 mt-0.5" />
                                                        <span className="text-sm">{alert.message}</span>
                                                    </div>
                                                </Td>
                                                <Td>
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        {formatTimeAgo(typeof alert.triggeredAt === 'string' ? alert.triggeredAt : alert.triggeredAt.toISOString())}
                                                    </span>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </TBody>
                                </Table>
                            </>
                        )}
                    </div>
                </Card>

                {/* Actividad Reciente - 1/3 width */}
                <Card>
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <PiClockDuotone className="text-xl text-gray-600 dark:text-gray-400" />
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Actividad Reciente
                            </h4>
                        </div>

                        <div className="space-y-4">
                            {recentActivities.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                                    No hay actividad reciente
                                </p>
                            ) : (
                                recentActivities.map((activity, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-3 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
                                    >
                                        <div className="mt-0.5">{activity.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                                                {activity.title}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-1">
                                                {activity.description}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                                {formatTimeAgo(activity.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </Container>
    )
}

export default AdminDashboardPage
