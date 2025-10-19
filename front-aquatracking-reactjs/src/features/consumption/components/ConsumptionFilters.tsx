import { useState } from 'react'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import DatePickerInput from '@/components/shared/DatePickerInput'
import { PiFunnelDuotone, PiXCircleDuotone } from 'react-icons/pi'

interface Home {
    _id: string
    name: string
}

type PeriodFilter = 'today' | 'week' | 'month' | 'custom' | null

interface ConsumptionFiltersProps {
    homes: Home[]
    consumptions: Array<{ date: string; homeId?: string }>
    onFilterHome: (homeId: string | null) => void
    onFilterDateRange: (
        startDate: string | null,
        endDate: string | null,
    ) => void
    onFilterPeriod: (period: PeriodFilter) => void
    currentPeriod: PeriodFilter
    onReset: () => void
}

const ConsumptionFilters = ({
    homes,
    consumptions,
    onFilterHome,
    onFilterDateRange,
    onFilterPeriod,
    currentPeriod,
    onReset,
}: ConsumptionFiltersProps) => {
    const [selectedHome, setSelectedHome] = useState<string>('')
    // Solo fechas con datos reales, sin duplicados y ordenadas
    console.log('consumptions for filter:', consumptions)
    const availableDates = Array.from(
        new Set(
            consumptions
                .filter((c) => c.date)
                .map((c) => {
                    const d = new Date(c.date)
                    d.setHours(0, 0, 0, 0)
                    return d.toISOString().slice(0, 10)
                })
        )
    )
        .map((dateStr) => {
            const d = new Date(dateStr)
            d.setHours(0, 0, 0, 0)
            return d
        })
        .sort((a, b) => a.getTime() - b.getTime())
    console.log('availableDates for calendar:', availableDates)
    const [selectedPeriod, setSelectedPeriod] = useState<string>(
        currentPeriod || '',
    )
    const [startDate, setStartDate] = useState<Date | undefined>(undefined)
    const [endDate, setEndDate] = useState<Date | undefined>(undefined)

    const homeOptions = [
        { value: '', label: 'Todos los hogares' },
        ...homes.map((home) => ({
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
            setStartDate(undefined)
            setEndDate(undefined)
        } else {
            onFilterPeriod(null)
        }
    }

    const handleStartDateChange = (date: Date | null) => {
        setStartDate(date ?? undefined)
        setSelectedPeriod('custom')
        onFilterDateRange(
            date ? date.toISOString().slice(0, 10) : null,
            endDate ? endDate.toISOString().slice(0, 10) : null,
        )
    }

    const handleEndDateChange = (date: Date | null) => {
        setEndDate(date ?? undefined)
        setSelectedPeriod('custom')
        onFilterDateRange(
            startDate ? startDate.toISOString().slice(0, 10) : null,
            date ? date.toISOString().slice(0, 10) : null,
        )
    }

    const handleReset = () => {
    setSelectedHome('')
    setSelectedPeriod('')
    setStartDate(undefined)
    setEndDate(undefined)
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
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Período
                    </label>
                    <Select
                        value={periodOptions.find(
                            (opt) => opt.value === selectedPeriod,
                        )}
                        options={periodOptions}
                        onChange={(option) =>
                            handlePeriodChange(option?.value || '')
                        }
                        placeholder="Seleccionar período"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Hogar
                    </label>
                    <Select
                        value={homeOptions.find(
                            (opt) => opt.value === selectedHome,
                        )}
                        options={homeOptions}
                        onChange={(option) =>
                            handleHomeChange(option?.value || '')
                        }
                        placeholder="Seleccionar hogar"
                    />
                </div>
                <div>
                    <DatePickerInput
                        value={startDate ?? null}
                        onChange={handleStartDateChange}
                        availableDates={availableDates}
                        label="Fecha inicio"
                    />
                </div>
                <div>
                    <DatePickerInput
                        value={endDate ?? null}
                        onChange={handleEndDateChange}
                        availableDates={availableDates}
                        label="Fecha fin"
                    />
                </div>

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
                                {
                                    homeOptions.find(
                                        (opt) => opt.value === selectedHome,
                                    )?.label
                                }
                            </span>
                        )}
                        {startDate && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mr-2">
                                Desde:{' '}
                                {new Date(startDate).toLocaleDateString(
                                    'es-CL',
                                )}
                            </span>
                        )}
                        {endDate && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Hasta:{' '}
                                {new Date(endDate).toLocaleDateString('es-CL')}
                            </span>
                        )}
                    </p>
                </div>
            )}
        </Card>
    )
}

export default ConsumptionFilters
