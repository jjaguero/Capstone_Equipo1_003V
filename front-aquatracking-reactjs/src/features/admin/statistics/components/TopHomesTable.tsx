import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import { PiWarningDuotone, PiDropDuotone, PiUsersDuotone, PiBellRingingDuotone } from 'react-icons/pi'

interface TopHome {
    homeId: string
    homeName: string
    totalConsumption: number
    averageDaily: number
    members: number
    consumptionPerPerson: number
    alertCount?: number
    status?: 'critical' | 'high' | 'warning'
}

interface TopHomesTableProps {
    homes: TopHome[]
}

const { Tr, Td, THead, TBody, Th } = Table

const TopHomesTable = ({ homes }: TopHomesTableProps) => {
    const getStatusInfo = (consumptionPerPerson: number, alertCount: number = 0) => {
        // Crítico: >200 L/persona/día O tiene alertas
        if (consumptionPerPerson > 200 || alertCount > 0) {
            return { 
                label: 'Crítico', 
                color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                priority: 3
            }
        }
        // Alto: 151-200 L/persona/día
        else if (consumptionPerPerson > 150) {
            return { 
                label: 'Alto', 
                color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
                priority: 2
            }
        }
        // Advertencia: cerca del límite
        else if (consumptionPerPerson > 120) {
            return { 
                label: 'Monitorear', 
                color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                priority: 1
            }
        }
        return { 
            label: 'Normal', 
            color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            priority: 0
        }
    }

    const getRecommendation = (consumptionPerPerson: number) => {
        if (consumptionPerPerson > 200) {
            return 'Revisar fugas o uso excesivo'
        } else if (consumptionPerPerson > 150) {
            return 'Optimizar hábitos de consumo'
        } else if (consumptionPerPerson > 120) {
            return 'Mantener monitoreo cercano'
        }
        return 'Consumo dentro del rango esperado'
    }

    if (homes.length === 0) {
        return (
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <PiWarningDuotone className="text-2xl text-green-600" />
                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Hogares que Requieren Atención
                    </h4>
                </div>
                <div className="text-center text-green-600 dark:text-green-400 py-8 bg-green-50 dark:bg-green-900/10 rounded-lg">
                    <PiWarningDuotone className="text-5xl mx-auto mb-2 opacity-50" />
                    <p className="font-medium">¡Excelente! No hay hogares con consumo anormal</p>
                    <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                        Todos los hogares están dentro de los rangos esperados
                    </p>
                </div>
            </Card>
        )
    }

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <PiWarningDuotone className="text-2xl text-red-600 dark:text-red-400" />
                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Hogares que Requieren Atención
                    </h4>
                </div>
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    {homes.length} {homes.length === 1 ? 'hogar' : 'hogares'}
                </Badge>
            </div>

            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-900 dark:text-amber-200">
                    <strong>Objetivo:</strong> Estos hogares tienen consumo anormal ({">"} 150 L/persona/día) o alertas activas. 
                    Se recomienda contactar para revisión de fugas o asesoría en ahorro de agua.
                </p>
            </div>

            <div className="overflow-x-auto">
                <Table hoverable>
                    <THead>
                        <Tr>
                            <Th>Hogar</Th>
                            <Th className="text-center">Habitantes</Th>
                            <Th className="text-right">Consumo Promedio</Th>
                            <Th className="text-right">L/Persona/Día</Th>
                            <Th className="text-center">Alertas</Th>
                            <Th className="text-center">Estado</Th>
                            <Th>Recomendación</Th>
                        </Tr>
                    </THead>
                    <TBody>
                        {homes.map((home) => {
                            const status = getStatusInfo(home.consumptionPerPerson, home.alertCount || 0)
                            const recommendation = getRecommendation(home.consumptionPerPerson)
                            return (
                                <Tr key={home.homeId}>
                                    <Td>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {home.homeName}
                                        </span>
                                    </Td>
                                    <Td className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <PiUsersDuotone className="text-gray-400" />
                                            <span>{home.members}</span>
                                        </div>
                                    </Td>
                                    <Td className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <PiDropDuotone className="text-cyan-500" />
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {home.averageDaily.toLocaleString('es-CL')} L/día
                                            </span>
                                        </div>
                                    </Td>
                                    <Td className="text-right">
                                        <span className={`font-bold ${
                                            home.consumptionPerPerson > 200 
                                                ? 'text-red-600 dark:text-red-400' 
                                                : home.consumptionPerPerson > 150 
                                                ? 'text-orange-600 dark:text-orange-400'
                                                : 'text-yellow-600 dark:text-yellow-400'
                                        }`}>
                                            {home.consumptionPerPerson} L
                                        </span>
                                    </Td>
                                    <Td className="text-center">
                                        {(home.alertCount || 0) > 0 ? (
                                            <div className="flex items-center justify-center gap-1">
                                                <PiBellRingingDuotone className="text-red-500 animate-pulse" />
                                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                    {home.alertCount}
                                                </Badge>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </Td>
                                    <Td className="text-center">
                                        <Badge className={status.color}>
                                            {status.label}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                            {recommendation}
                                        </span>
                                    </Td>
                                </Tr>
                            )
                        })}
                    </TBody>
                </Table>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Normal: ≤120 L/persona/día</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span>Monitorear: 121-150 L/persona/día</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span>Alto: 151-200 L/persona/día</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span>Crítico: &gt;200 L/persona/día o con alertas</span>
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default TopHomesTable
