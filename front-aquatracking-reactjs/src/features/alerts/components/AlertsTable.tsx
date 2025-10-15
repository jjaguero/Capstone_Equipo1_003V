import { useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Pagination from '@/components/ui/Pagination'
import { 
    PiWarningCircleDuotone, 
    PiCheckCircleDuotone, 
    PiFireDuotone,
    PiHouseDuotone 
} from 'react-icons/pi'

interface Alert {
    _id: string
    homeId: string
    type: string
    message: string
    triggeredAt: string
    resolved: boolean
}

interface Home {
    _id: string
    name: string
}

interface AlertsTableProps {
    alerts: Alert[]
    homes: Home[]
}

const { Tr, Td, THead, TBody, Th } = Table

const AlertsTable = ({ alerts, homes }: AlertsTableProps) => {
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 15

    const tableData = useMemo(() => {
        return alerts
            .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())
            .map(alert => {
                const home = homes.find(h => h._id === alert.homeId)
                return {
                    ...alert,
                    homeName: home?.name || 'Desconocido',
                }
            })
    }, [alerts, homes])

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return tableData.slice(startIndex, endIndex)
    }, [tableData, currentPage])

    const totalPages = Math.ceil(tableData.length / itemsPerPage)

    const getTypeIcon = (type: string) => {
        if (type === 'critical_consumption') {
            return <PiFireDuotone className="text-red-500 text-xl" />
        }
        return <PiWarningCircleDuotone className="text-orange-500 text-xl" />
    }

    const getTypeBadge = (type: string) => {
        if (type === 'critical_consumption') {
            return (
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    Crítico
                </Badge>
            )
        }
        return (
            <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                Alto
            </Badge>
        )
    }

    if (alerts.length === 0) {
        return (
            <Card>
                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                    <PiCheckCircleDuotone className="text-6xl text-green-500 mb-3" />
                    <p className="text-lg font-medium">No hay alertas para mostrar</p>
                    <p className="text-sm">Todos los hogares están dentro del límite</p>
                </div>
            </Card>
        )
    }

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Historial de Alertas
                </h4>
                <Badge className="bg-blue-100 text-blue-800">
                    {tableData.length} {tableData.length === 1 ? 'alerta' : 'alertas'}
                </Badge>
            </div>

            <div className="overflow-x-auto">
                <Table hoverable>
                    <THead>
                        <Tr>
                            <Th>Tipo</Th>
                            <Th>Fecha/Hora</Th>
                            <Th>Hogar</Th>
                            <Th>Mensaje</Th>
                            <Th className="text-center">Estado</Th>
                        </Tr>
                    </THead>
                    <TBody>
                        {paginatedData.map((alert) => (
                            <Tr key={alert._id} className={alert.resolved ? 'opacity-60' : ''}>
                                <Td>
                                    <div className="flex items-center gap-2">
                                        {getTypeIcon(alert.type)}
                                        {getTypeBadge(alert.type)}
                                    </div>
                                </Td>
                                <Td>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {new Date(alert.triggeredAt).toLocaleDateString('es-CL', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(alert.triggeredAt).toLocaleTimeString('es-CL', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                </Td>
                                <Td>
                                    <div className="flex items-center gap-2">
                                        <PiHouseDuotone className="text-gray-400" />
                                        <span className="font-medium">{alert.homeName}</span>
                                    </div>
                                </Td>
                                <Td>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 max-w-md">
                                        {alert.message}
                                    </p>
                                </Td>
                                <Td className="text-center">
                                    {alert.resolved ? (
                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                            <PiCheckCircleDuotone className="inline mr-1" />
                                            Resuelta
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                            Pendiente
                                        </Badge>
                                    )}
                                </Td>
                            </Tr>
                        ))}
                    </TBody>
                </Table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Mostrando {((currentPage - 1) * itemsPerPage) + 1} a{' '}
                        {Math.min(currentPage * itemsPerPage, tableData.length)} de{' '}
                        {tableData.length} alertas
                    </p>
                    <Pagination
                        currentPage={currentPage}
                        total={tableData.length}
                        pageSize={itemsPerPage}
                        onChange={setCurrentPage}
                        displayTotal
                    />
                </div>
            )}
        </Card>
    )
}

export default AlertsTable
