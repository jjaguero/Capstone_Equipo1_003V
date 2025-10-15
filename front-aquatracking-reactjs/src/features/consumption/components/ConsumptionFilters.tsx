import { useState } from 'react'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { PiFunnelDuotone, PiXCircleDuotone } from 'react-icons/pi'

interface Home {
    _id: string
    name: string
}

type PeriodFilter = 'today' | 'week' | 'month' | 'custom' | null

interface ConsumptionFiltersProps {
    homes: Home[]
    onFilterHome: (homeId: string | null) => void
    onFilterDateRange: (startDate: string | null, endDate: string | null) => void
    onFilterPeriod: (period: PeriodFilter) => void
    currentPeriod: PeriodFilter
    onReset: () => void
}

const ConsumptionFilters = ({ homes, onFilterHome, onFilterDateRange, onFilterPeriod, currentPeriod, onReset }: ConsumptionFiltersProps) => {
    const [selectedHome, setSelectedHome] = useState<string>('')
    const [selectedPeriod, setSelectedPeriod] = useState<string>(currentPeriod || '')
    const [startDate, setStartDate] = useState<string>('')
    const [endDate, setEndDate] = useState<string>('')

    const homeOptions = [
        { value: '', label: 'Todos los hogares' },
        ...homes.map(home => ({
            value: home._id,
            label: home.name,
        })),
    ]

    const periodOptions = [
        { value: '', label: 'Todo el período' },
        { value: 'today', label: 'Hoy' },
        { value: 'week', label: 'Última semana' },
        { value: 'month', label: 'Último mes' },
    ]

    const handleHomeChange = (value: string) => {
        setSelectedHome(value)
        onFilterHome(value || null)
    }

    const handlePeriodChange = (value: string) => {
        setSelectedPeriod(value)
        if (value === 'today' || value === 'week' || value === 'month') {
            onFilterPeriod(value as PeriodFilter)
            setStartDate('')
            setEndDate('')
        } else {
            onFilterPeriod(null)
        }
    }

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setStartDate(value)
        setSelectedPeriod('custom')
        onFilterDateRange(value || null, endDate || null)
    }

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setEndDate(value)
        setSelectedPeriod('custom')
        onFilterDateRange(startDate || null, value || null)
    }

    const handleReset = () => {
        setSelectedHome('')
        setSelectedPeriod('')
        setStartDate('')
        setEndDate('')
        onReset()
        onFilterHome(null)
        onFilterPeriod(null)
        onFilterDateRange(null, null)
    }

    const hasFilters = selectedHome || selectedPeriod || startDate || endDate

    return (
        <Card className="mb-6">
            <div className="flex items-center gap-2 mb-4">
                <PiFunnelDuotone className="text-xl text-gray-600" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Filtros
                </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Filtro por período */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Período
                    </label>
                    <Select
                        value={periodOptions.find(opt => opt.value === selectedPeriod)}
                        options={periodOptions}
                        onChange={(option) => handlePeriodChange(option?.value || '')}
                        placeholder="Seleccionar período"
                    />
                </div>

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

                {/* Filtro fecha inicio */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fecha inicio
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={handleStartDateChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                    />
                </div>

                {/* Filtro fecha fin */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fecha fin
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={handleEndDateChange}
                        min={startDate}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
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
                        {startDate && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mr-2">
                                Desde: {new Date(startDate).toLocaleDateString('es-CL')}
                            </span>
                        )}
                        {endDate && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Hasta: {new Date(endDate).toLocaleDateString('es-CL')}
                            </span>
                        )}
                    </p>
                </div>
            )}
        </Card>
    )
}

export default ConsumptionFilters
