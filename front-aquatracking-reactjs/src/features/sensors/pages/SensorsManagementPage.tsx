import { useState, useMemo } from 'react'
import {
    PiDropDuotone,
    PiHouseDuotone,
    PiCheckCircleDuotone,
    PiXCircleDuotone,
    PiWarningDuotone,
    PiMinusCircleDuotone,
} from 'react-icons/pi'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import Table from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import { useSensors } from '@/features/sensors/hooks/useSensors'
import { useHomes } from '@/features/homes/hooks/useHomes'
import { useSensorConsumption } from '@/features/sensors/hooks/useSensorConsumption'
import type { Sensor, Home } from '@/@types/entities'
import {
    SENSOR_STATUS,
    getLocationLabel,
    getSensorTypeLabel,
} from '@/features/sensors/constants/sensors.constant'

const { Tr, Td, THead, TBody, Th } = Table

const SensorsManagementPage = () => {
    const { sensors, loading } = useSensors()
    const { homes } = useHomes()
    const { getConsumption, loading: loadingConsumption } = useSensorConsumption()

    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [homeFilter, setHomeFilter] = useState<string>('all')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 15 // Paginación para escalar a 80+ sensores

    // Filtrar sensores
    const filteredSensors = useMemo(() => {
        return sensors.filter((sensor: Sensor) => {
            const matchesSearch =
                sensor.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sensor.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (sensor.subType?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
                (sensor.location?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

            const matchesStatus = statusFilter === 'all' || sensor.status === statusFilter
            const matchesHome = homeFilter === 'all' || sensor.homeId === homeFilter

            return matchesSearch && matchesStatus && matchesHome
        })
    }, [sensors, searchTerm, statusFilter, homeFilter])

    // Paginación
    const paginatedSensors = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return filteredSensors.slice(startIndex, endIndex)
    }, [filteredSensors, currentPage])

    const totalPages = Math.ceil(filteredSensors.length / itemsPerPage)

    // Helper para obtener nombre del hogar
    const getHomeName = (homeId: string | undefined) => {
        if (!homeId) return 'Sin asignar'
        const home = homes.find((h: Home) => h._id === homeId)
        return home ? home.name : 'Sin asignar'
    }

    // Obtener icono y color según estado
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <PiCheckCircleDuotone className="text-green-500 text-3xl" />
            case 'inactive':
                return <PiXCircleDuotone className="text-red-500 text-3xl" />
            case 'maintenance':
                return <PiWarningDuotone className="text-amber-500 text-3xl" />
            default:
                return <PiCheckCircleDuotone className="text-gray-400 text-3xl" />
        }
    }

    const getStatusBadge = (status: string) => {
        const statusConfig = SENSOR_STATUS.find((s) => s.value === status)
        const colorMap: Record<string, string> = {
            active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700',
            inactive: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-700',
            maintenance:
                'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700',
        }

        return (
            <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colorMap[status] || colorMap.active}`}
            >
                {statusConfig?.label || status}
            </span>
        )
    }

    // Estadísticas de sensores
    const stats = useMemo(() => {
        const active = sensors.filter((s: Sensor) => s.status === 'active').length
        const inactive = sensors.filter((s: Sensor) => s.status === 'inactive').length
        const maintenance = sensors.filter((s: Sensor) => s.status === 'maintenance').length

        return { active, inactive, maintenance, total: sensors.length }
    }, [sensors])

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="animate-fadeIn">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Gestión de Sensores
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Monitoreo y administración de sensores del sistema
                </p>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total</p>
                            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">{stats.total}</p>
                        </div>
                        <PiDropDuotone className="text-5xl text-blue-500" />
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Activos</p>
                            <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">{stats.active}</p>
                        </div>
                        <PiCheckCircleDuotone className="text-5xl text-emerald-500" />
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 border-rose-200 dark:border-rose-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-rose-700 dark:text-rose-300">Inactivos</p>
                            <p className="text-3xl font-bold text-rose-900 dark:text-rose-100 mt-1">{stats.inactive}</p>
                        </div>
                        <PiXCircleDuotone className="text-5xl text-rose-500" />
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                Mantenimiento
                            </p>
                            <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-1">
                                {stats.maintenance}
                            </p>
                        </div>
                        <PiWarningDuotone className="text-5xl text-amber-500" />
                    </div>
                </Card>
            </div>

            {/* Tabla de sensores */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 animate-slideUp" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Sensores Instalados
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Vista general de todos los sensores del sistema
                        </p>
                    </div>
                </div>

                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Input
                        placeholder="Buscar por serial, categoría, tipo o ubicación..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        prefix={<PiDropDuotone className="text-lg" />}
                        className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                    />

                    <select
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                        value={homeFilter}
                        onChange={(e) => setHomeFilter(e.target.value)}
                    >
                        <option value="all">Todos los hogares</option>
                        {homes.map((home: Home) => (
                            <option key={home._id} value={home._id}>
                                {home.name}
                            </option>
                        ))}
                    </select>

                    <select
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Todos los estados</option>
                        {SENSOR_STATUS.map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tabla de sensores - Vista escalable para 80+ sensores */}
                {loading || loadingConsumption ? (
                    <div className="text-center py-12 text-gray-500">
                        Cargando sensores...
                    </div>
                ) : filteredSensors.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No se encontraron sensores
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <Table hoverable>
                                <THead>
                                    <Tr>
                                        <Th>Estado</Th>
                                        <Th>Serial Number</Th>
                                        <Th>Tipo</Th>
                                        <Th>Ubicación</Th>
                                        <Th>Hogar</Th>
                                        <Th className="text-right">Consumo Hoy</Th>
                                        <Th className="text-right">Consumo Ayer</Th>
                                        <Th className="text-center">Última Lectura</Th>
                                    </Tr>
                                </THead>
                                <TBody>
                                    {paginatedSensors.map((sensor: Sensor) => {
                                        const consumption = getConsumption(sensor._id || '')
                                        const todayLiters = consumption?.todayLiters || 0
                                        const yesterdayLiters = consumption?.yesterdayLiters || 0
                                        const lastReading = consumption?.lastReading

                                        return (
                                            <Tr key={sensor._id}>
                                                <Td>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(sensor.status)}
                                                        {getStatusBadge(sensor.status)}
                                                    </div>
                                                </Td>
                                                <Td>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-gray-900 dark:text-white">
                                                            {sensor.serialNumber}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {sensor.category}
                                                        </span>
                                                    </div>
                                                </Td>
                                                <Td>
                                                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                        {sensor.subType
                                                            ? getSensorTypeLabel(sensor.subType)
                                                            : '-'}
                                                    </Badge>
                                                </Td>
                                                <Td>
                                                    <span className="text-sm">
                                                        {sensor.location
                                                            ? getLocationLabel(sensor.location)
                                                            : '-'}
                                                    </span>
                                                </Td>
                                                <Td>
                                                    <div className="flex items-center gap-2">
                                                        <PiHouseDuotone className="text-gray-400" />
                                                        <span className="font-medium">
                                                            {getHomeName(sensor.homeId)}
                                                        </span>
                                                    </div>
                                                </Td>
                                                <Td className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                            {Math.round(todayLiters).toLocaleString('es-CL')}
                                                        </span>
                                                        <span className="text-xs text-gray-500">L</span>
                                                    </div>
                                                </Td>
                                                <Td className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                            {Math.round(yesterdayLiters).toLocaleString('es-CL')}
                                                        </span>
                                                        <span className="text-xs text-gray-500">L</span>
                                                    </div>
                                                </Td>
                                                <Td className="text-center">
                                                    {lastReading ? (
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                                                {new Date(lastReading).toLocaleDateString('es-CL')}
                                                            </span>
                                                            <span className="text-xs text-gray-400">
                                                                {new Date(lastReading).toLocaleTimeString('es-CL', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </Td>
                                            </Tr>
                                        )
                                    })}
                                </TBody>
                            </Table>
                        </div>

                        {/* Paginación */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} a{' '}
                                    {Math.min(currentPage * itemsPerPage, filteredSensors.length)} de{' '}
                                    {filteredSensors.length} sensores
                                </p>
                                <Pagination
                                    currentPage={currentPage}
                                    total={filteredSensors.length}
                                    pageSize={itemsPerPage}
                                    onChange={setCurrentPage}
                                    displayTotal
                                />
                            </div>
                        )}
                    </>
                )}
            </Card>
        </div>
    )
}

export default SensorsManagementPage
