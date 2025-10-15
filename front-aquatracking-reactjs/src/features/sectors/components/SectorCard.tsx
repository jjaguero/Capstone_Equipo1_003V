import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { 
    PiHouseDuotone, 
    PiDropDuotone, 
    PiWarningDuotone,
    PiUsersDuotone 
} from 'react-icons/pi'

interface SectorCardProps {
    sectorName: string
    totalHomes: number
    totalConsumption: number
    averageConsumption: number
    totalAlerts: number
    pendingAlerts: number
    totalMembers: number
}

const SectorCard = ({
    sectorName,
    totalHomes,
    totalConsumption,
    averageConsumption,
    totalAlerts,
    pendingAlerts,
    totalMembers,
}: SectorCardProps) => {
    return (
        <Card className="hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {sectorName}
                </h3>
                {pendingAlerts > 0 && (
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                        <PiWarningDuotone className="inline mr-1" />
                        {pendingAlerts} {pendingAlerts === 1 ? 'alerta' : 'alertas'}
                    </Badge>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                        <PiHouseDuotone className="text-xl text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Hogares</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {totalHomes}
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-lg">
                        <PiUsersDuotone className="text-xl text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Habitantes</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {totalMembers}
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="bg-cyan-100 dark:bg-cyan-900 p-2 rounded-lg">
                        <PiDropDuotone className="text-xl text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Consumo Total</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {(totalConsumption || 0).toLocaleString('es-CL')} L
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                        <PiDropDuotone className="text-xl text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Promedio/Hogar</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {(averageConsumption || 0).toLocaleString('es-CL')} L
                        </p>
                    </div>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                        Total de alertas
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                        {totalAlerts}
                    </span>
                </div>
            </div>
        </Card>
    )
}

export default SectorCard
