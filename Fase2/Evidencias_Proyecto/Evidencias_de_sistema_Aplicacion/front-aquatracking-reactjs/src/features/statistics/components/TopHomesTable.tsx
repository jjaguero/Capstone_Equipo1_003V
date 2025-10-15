import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import { PiTrophyDuotone, PiDropDuotone, PiUsersDuotone } from 'react-icons/pi'

interface TopHome {
    homeId: string
    homeName: string
    totalConsumption: number
    averageDaily: number
    members: number
    consumptionPerPerson: number
}

interface TopHomesTableProps {
    homes: TopHome[]
}

const { Tr, Td, THead, TBody, Th } = Table

const TopHomesTable = ({ homes }: TopHomesTableProps) => {
    const getRankIcon = (index: number) => {
        const colors = ['text-yellow-500', 'text-gray-400', 'text-orange-600']
        return <PiTrophyDuotone className={`text-2xl ${colors[index] || 'text-gray-300'}`} />
    }

    const getConsumptionLevel = (consumptionPerPerson: number) => {
        if (consumptionPerPerson <= 150) {
            return { label: 'Normal', color: 'bg-green-100 text-green-800' }
        } else if (consumptionPerPerson <= 200) {
            return { label: 'Alto', color: 'bg-orange-100 text-orange-800' }
        } else {
            return { label: 'Crítico', color: 'bg-red-100 text-red-800' }
        }
    }

    if (homes.length === 0) {
        return (
            <Card>
                <div className="text-center text-gray-500 py-8">
                    <p>No hay datos de consumo disponibles</p>
                </div>
            </Card>
        )
    }

    return (
        <Card>
            <div className="flex items-center gap-2 mb-4">
                <PiTrophyDuotone className="text-2xl text-yellow-500" />
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Top 5 Hogares por Consumo
                </h4>
            </div>

            <div className="overflow-x-auto">
                <Table hoverable>
                    <THead>
                        <Tr>
                            <Th className="text-center">#</Th>
                            <Th>Hogar</Th>
                            <Th className="text-center">Habitantes</Th>
                            <Th className="text-right">Consumo Total</Th>
                            <Th className="text-right">Promedio Diario</Th>
                            <Th className="text-right">L/Persona/Día</Th>
                            <Th className="text-center">Nivel</Th>
                        </Tr>
                    </THead>
                    <TBody>
                        {homes.map((home, index) => {
                            const level = getConsumptionLevel(home.consumptionPerPerson)
                            return (
                                <Tr key={home.homeId}>
                                    <Td className="text-center">
                                        {getRankIcon(index)}
                                    </Td>
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
                                            <span className="font-semibold">
                                                {home.totalConsumption.toLocaleString('es-CL')} L
                                            </span>
                                        </div>
                                    </Td>
                                    <Td className="text-right">
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {home.averageDaily.toLocaleString('es-CL')} L
                                        </span>
                                    </Td>
                                    <Td className="text-right">
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {home.consumptionPerPerson} L
                                        </span>
                                    </Td>
                                    <Td className="text-center">
                                        <Badge className={level.color}>
                                            {level.label}
                                        </Badge>
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
                        <span>Normal: ≤150 L/persona/día</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span>Alto: 151-200 L/persona/día</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span>Crítico: &gt;200 L/persona/día</span>
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default TopHomesTable
