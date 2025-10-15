import { useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'
import { PiWarningCircleDuotone, PiCheckCircleDuotone } from 'react-icons/pi'

interface DailyConsumption {
    _id: string
    homeId: string
    date: string
    totalLiters: number
    limitLiters: number
    recommendedLiters: number
    alerts: {
        type: string
        message: string
    }[]
}

interface Home {
    _id: string
    name: string
}

interface ConsumptionTableProps {
    consumptions: DailyConsumption[]
    homes: Home[]
}

const { Tr, Td, THead, TBody, Th } = Table

const ConsumptionTable = ({ consumptions, homes }: ConsumptionTableProps) => {
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 15

    const tableData = useMemo(() => {
        return consumptions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(consumption => {
                const home = homes.find(h => h._id === consumption.homeId)
                const percentage = (consumption.totalLiters / consumption.limitLiters) * 100
                
                let status: 'success' | 'warning' | 'danger' = 'success'
                let statusText = 'Normal'
                
                if (percentage >= 150) {
                    status = 'danger'
                    statusText = 'Crítico'
                } else if (percentage >= 125) {
                    status = 'danger'
                    statusText = 'Alto'
                } else if (percentage >= 100) {
                    status = 'warning'
                    statusText = 'Límite alcanzado'
                }

                return {
                    ...consumption,
                    homeName: home?.name || 'Desconocido',
                    percentage: Math.round(percentage),
                    status,
                    statusText,
                }
            })
    }, [consumptions, homes])

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return tableData.slice(startIndex, endIndex)
    }, [tableData, currentPage])

    const totalPages = Math.ceil(tableData.length / itemsPerPage)

    if (consumptions.length === 0) {
        return (
            <Card>
                <div className="flex items-center justify-center h-32 text-gray-500">
                    <p>No hay datos de consumo disponibles</p>
                </div>
            </Card>
        )
    }

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Historial de Consumo Diario
                </h4>
                <Badge className="bg-blue-100 text-blue-800">
                    {tableData.length} registros
                </Badge>
            </div>

            <div className="overflow-x-auto">
                <Table hoverable>
                    <THead>
                        <Tr>
                            <Th>Fecha</Th>
                            <Th>Hogar</Th>
                            <Th className="text-right">Consumo (L)</Th>
                            <Th className="text-right">Límite (L)</Th>
                            <Th className="text-right">% Uso</Th>
                            <Th className="text-center">Estado</Th>
                            <Th className="text-center">Alertas</Th>
                        </Tr>
                    </THead>
                    <TBody>
                        {paginatedData.map((row) => (
                            <Tr key={row._id}>
                                <Td>
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {new Date(row.date).toLocaleDateString('es-CL', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(row.date).toLocaleDateString('es-CL', {
                                                weekday: 'long',
                                            })}
                                        </span>
                                    </div>
                                </Td>
                                <Td>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                        {row.homeName}
                                    </span>
                                </Td>
                                <Td className="text-right">
                                    <span className="font-semibold text-blue-600">
                                        {Math.round(row.totalLiters).toLocaleString('es-CL')}
                                    </span>
                                </Td>
                                <Td className="text-right">
                                    <span className="text-gray-600">
                                        {Math.round(row.limitLiters).toLocaleString('es-CL')}
                                    </span>
                                </Td>
                                <Td className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${
                                                    row.status === 'danger'
                                                        ? 'bg-red-500'
                                                        : row.status === 'warning'
                                                        ? 'bg-yellow-500'
                                                        : 'bg-green-500'
                                                }`}
                                                style={{ width: `${Math.min(row.percentage, 100)}%` }}
                                            />
                                        </div>
                                        <span className="font-medium text-sm">
                                            {row.percentage}%
                                        </span>
                                    </div>
                                </Td>
                                <Td className="text-center">
                                    <Badge className={`
                                        ${row.status === 'danger' ? 'bg-red-100 text-red-800' : ''}
                                        ${row.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : ''}
                                        ${row.status === 'success' ? 'bg-green-100 text-green-800' : ''}
                                    `}>
                                        {row.status === 'success' && <PiCheckCircleDuotone className="inline mr-1" />}
                                        {row.status !== 'success' && <PiWarningCircleDuotone className="inline mr-1" />}
                                        {row.statusText}
                                    </Badge>
                                </Td>
                                <Td className="text-center">
                                    {row.alerts.length > 0 ? (
                                        <Badge className="bg-red-100 text-red-800">
                                            {row.alerts.length} {row.alerts.length === 1 ? 'alerta' : 'alertas'}
                                        </Badge>
                                    ) : (
                                        <span className="text-gray-400">-</span>
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
                        {tableData.length} registros
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

export default ConsumptionTable
