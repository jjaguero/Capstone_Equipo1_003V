import { useState } from 'react'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { PiFunnelDuotone, PiXCircleDuotone } from 'react-icons/pi'

interface Home {
    _id: string
    name: string
    address: string
}

interface AlertsFiltersProps {
    homes: Home[]
    onFilterHome: (homeId: string | null) => void
    onFilterType: (type: string | null) => void
    onFilterStatus: (resolved: boolean | null) => void
    onReset: () => void
}

const AlertsFilters = ({ homes, onFilterHome, onFilterType, onFilterStatus, onReset }: AlertsFiltersProps) => {
    const [selectedHome, setSelectedHome] = useState<{ value: string; label: string } | null>(null)
    const [selectedType, setSelectedType] = useState<{ value: string; label: string } | null>(null)
    const [selectedStatus, setSelectedStatus] = useState<{ value: string; label: string } | null>(null)

    const homeOptions = [
        { value: '', label: 'Todos los hogares' },
        ...homes.map(home => ({
            value: home._id,
            label: `${home.name} - ${home.address}`
        }))
    ]

    const typeOptions = [
        { value: '', label: 'Todos los tipos' },
        { value: 'critical', label: 'Crítico (>100%)' },
        { value: 'warning', label: 'Advertencia (90-100%)' }
    ]

    const statusOptions = [
        { value: '', label: 'Todas' },
        { value: 'pending', label: 'Pendientes' },
        { value: 'resolved', label: 'Resueltas' }
    ]

    const handleHomeChange = (option: any) => {
        setSelectedHome(option)
        onFilterHome(option?.value || null)
    }

    const handleTypeChange = (option: any) => {
        setSelectedType(option)
        onFilterType(option?.value || null)
    }

    const handleStatusChange = (option: any) => {
        setSelectedStatus(option)
        if (!option || option.value === '') {
            onFilterStatus(null)
        } else if (option.value === 'pending') {
            onFilterStatus(false)
        } else if (option.value === 'resolved') {
            onFilterStatus(true)
        }
    }

    const handleReset = () => {
        setSelectedHome(null)
        setSelectedType(null)
        setSelectedStatus(null)
        onReset()
    }

    return (
        <Card className="mb-6">
            <div className="flex items-center gap-2 mb-4">
                <PiFunnelDuotone className="text-xl text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Filtros
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Hogar
                    </label>
                    <Select
                        options={homeOptions}
                        value={selectedHome}
                        onChange={handleHomeChange}
                        placeholder="Todos los hogares"
                        isClearable
                        menuPortalTarget={document.body}
                        styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 })
                        }}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tipo de alerta
                    </label>
                    <Select
                        options={typeOptions}
                        value={selectedType}
                        onChange={handleTypeChange}
                        placeholder="Todos los tipos"
                        isClearable
                        menuPortalTarget={document.body}
                        styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 })
                        }}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Estado
                    </label>
                    <Select
                        options={statusOptions}
                        value={selectedStatus}
                        onChange={handleStatusChange}
                        placeholder="Todas"
                        isClearable
                        menuPortalTarget={document.body}
                        styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 })
                        }}
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <Button
                    size="sm"
                    variant="plain"
                    onClick={handleReset}
                    icon={<PiXCircleDuotone />}
                >
                    Limpiar filtros
                </Button>
            </div>
        </Card>
    )
}

export default AlertsFilters
