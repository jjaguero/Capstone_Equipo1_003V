import { useState } from 'react'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { PiFunnelDuotone, PiXCircleDuotone } from 'react-icons/pi'

interface Home {
    _id: string
    name: string
}

interface AlertsFiltersProps {
    homes: Home[]
    onFilterHome: (homeId: string | null) => void
    onFilterType: (type: string | null) => void
    onFilterStatus: (resolved: boolean | null) => void
    onReset: () => void
}

const AlertsFilters = ({ homes, onFilterHome, onFilterType, onFilterStatus, onReset }: AlertsFiltersProps) => {
    const [selectedHome, setSelectedHome] = useState<string>('')
    const [selectedType, setSelectedType] = useState<string>('')
    const [selectedStatus, setSelectedStatus] = useState<string>('')

    const homeOptions = [
        { value: '', label: 'Todos los hogares' },
        ...homes.map(home => ({
            value: home._id,
            label: home.name,
        })),
    ]

    const typeOptions = [
        { value: '', label: 'Todos los tipos' },
        { value: 'high_consumption', label: 'Alto consumo' },
        { value: 'critical_consumption', label: 'Consumo crítico' },
    ]

    const statusOptions = [
        { value: '', label: 'Todos los estados' },
        { value: 'pending', label: 'Pendientes' },
        { value: 'resolved', label: 'Resueltas' },
    ]

    const handleHomeChange = (value: string) => {
        setSelectedHome(value)
        onFilterHome(value || null)
    }

    const handleTypeChange = (value: string) => {
        setSelectedType(value)
        onFilterType(value || null)
    }

    const handleStatusChange = (value: string) => {
        setSelectedStatus(value)
        if (value === 'pending') {
            onFilterStatus(false)
        } else if (value === 'resolved') {
            onFilterStatus(true)
        } else {
            onFilterStatus(null)
        }
    }

    const handleReset = () => {
        setSelectedHome('')
        setSelectedType('')
        setSelectedStatus('')
        onReset()
        onFilterHome(null)
        onFilterType(null)
        onFilterStatus(null)
    }

    const hasFilters = selectedHome || selectedType || selectedStatus

    return (
        <Card className="mb-6">
            <div className="flex items-center gap-2 mb-4">
                <PiFunnelDuotone className="text-xl text-gray-600" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Filtros
                </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Filtro por hogar */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Hogar
                    </label>
                    <Select
                        value={homeOptions.find(opt => opt.value === selectedHome)}
                        options={homeOptions}
                        onChange={(option) => handleHomeChange(option?.value || '')}
                        placeholder="Seleccionar hogar"
                    />
                </div>

                {/* Filtro por tipo */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tipo de alerta
                    </label>
                    <Select
                        value={typeOptions.find(opt => opt.value === selectedType)}
                        options={typeOptions}
                        onChange={(option) => handleTypeChange(option?.value || '')}
                        placeholder="Seleccionar tipo"
                    />
                </div>

                {/* Filtro por estado */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Estado
                    </label>
                    <Select
                        value={statusOptions.find(opt => opt.value === selectedStatus)}
                        options={statusOptions}
                        onChange={(option) => handleStatusChange(option?.value || '')}
                        placeholder="Seleccionar estado"
                    />
                </div>

                {/* Botón limpiar filtros */}
                <div className="flex items-end">
                    <Button
                        variant="plain"
                        onClick={handleReset}
                        disabled={!hasFilters}
                        className="w-full"
                        icon={<PiXCircleDuotone />}
                    >
                        Limpiar filtros
                    </Button>
                </div>
            </div>

            {hasFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Filtros activos:</span>{' '}
                        {selectedHome && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2">
                                {homeOptions.find(opt => opt.value === selectedHome)?.label}
                            </span>
                        )}
                        {selectedType && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 mr-2">
                                {typeOptions.find(opt => opt.value === selectedType)?.label}
                            </span>
                        )}
                        {selectedStatus && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                {statusOptions.find(opt => opt.value === selectedStatus)?.label}
                            </span>
                        )}
                    </p>
                </div>
            )}
        </Card>
    )
}

export default AlertsFilters
