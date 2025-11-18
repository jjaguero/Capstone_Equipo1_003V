import Card from '@/components/ui/Card'
import { PiArrowUpRightDuotone, PiArrowDownRightDuotone, PiMinusDuotone } from 'react-icons/pi'

interface SectorStats {
    sectorName: string
    totalConsumption: number
    averageConsumption: number
    totalHomes: number
    totalMembers: number
}

interface SectorComparisonProps {
    stats: SectorStats[]
}

const SectorComparison = ({ stats }: SectorComparisonProps) => {
    if (stats.length < 2) {
        return (
            <Card>
                <p className="text-center text-gray-500 py-8">
                    Se necesitan al menos 2 sectores para comparar
                </p>
            </Card>
        )
    }

    const [sector1, sector2] = stats

    const comparisons = [
        {
            label: 'Consumo Total',
            sector1: sector1.totalConsumption,
            sector2: sector2.totalConsumption,
            unit: 'L',
        },
        {
            label: 'Promedio por Hogar',
            sector1: sector1.averageConsumption,
            sector2: sector2.averageConsumption,
            unit: 'L/hogar',
        },
        {
            label: 'Cantidad de Hogares',
            sector1: sector1.totalHomes,
            sector2: sector2.totalHomes,
            unit: 'hogares',
        },
        {
            label: 'Total Habitantes',
            sector1: sector1.totalMembers,
            sector2: sector2.totalMembers,
            unit: 'personas',
        },
    ]

    const getComparisonIcon = (value1: number, value2: number) => {
        // Validar que ambos valores sean números válidos
        if (!value1 || !value2 || isNaN(value1) || isNaN(value2) || value2 === 0) {
            return <PiMinusDuotone className="text-gray-500" />
        }
        
        const diff = ((value1 - value2) / value2) * 100
        
        if (Math.abs(diff) < 5) {
            return <PiMinusDuotone className="text-gray-500" />
        }
        
        if (value1 > value2) {
            return <PiArrowUpRightDuotone className="text-red-500" />
        }
        
        return <PiArrowDownRightDuotone className="text-green-500" />
    }

    const getComparisonText = (value1: number, value2: number) => {
        // Validar que ambos valores sean números válidos
        if (!value1 || !value2 || isNaN(value1) || isNaN(value2) || value2 === 0) {
            return 'Sin datos suficientes'
        }
        
        const diff = ((value1 - value2) / value2) * 100
        
        if (Math.abs(diff) < 5) {
            return 'Similar'
        }
        
        return `${Math.abs(diff).toFixed(1)}% ${value1 > value2 ? 'más' : 'menos'}`
    }

    return (
        <Card>
            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                Comparación entre Sectores
            </h4>

            <div className="space-y-4">
                {comparisons.map((comparison, index) => (
                    <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {comparison.label}
                        </p>
                        <div className="grid grid-cols-3 gap-4 items-center">
                            {/* Sector 1 */}
                            <div className="text-center">
                                <p className="text-xs text-gray-500 mb-1">{sector1.sectorName}</p>
                                <p className="text-lg font-bold text-blue-600">
                                    {comparison.sector1.toLocaleString('es-CL')}
                                </p>
                                <p className="text-xs text-gray-500">{comparison.unit}</p>
                            </div>

                            {/* Comparison Icon */}
                            <div className="flex flex-col items-center">
                                <div className="text-2xl">
                                    {getComparisonIcon(comparison.sector1, comparison.sector2)}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    {getComparisonText(comparison.sector1, comparison.sector2)}
                                </p>
                            </div>

                            {/* Sector 2 */}
                            <div className="text-center">
                                <p className="text-xs text-gray-500 mb-1">{sector2.sectorName}</p>
                                <p className="text-lg font-bold text-purple-600">
                                    {comparison.sector2.toLocaleString('es-CL')}
                                </p>
                                <p className="text-xs text-gray-500">{comparison.unit}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    )
}

export default SectorComparison
