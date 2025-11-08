import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { PiCalendarDuotone } from 'react-icons/pi'
import MuiDateCalendarInput from '@/components/shared/MuiDateCalendarInput'
import type { Dayjs } from 'dayjs'

type PeriodFilter = 'week' | 'month' | 'quarter' | null

interface SectorPeriodFilterProps {
    currentPeriod: PeriodFilter
    onFilterPeriod: (period: PeriodFilter) => void
    dateFrom: Dayjs | null
    dateTo: Dayjs | null
    onDateFromChange: (date: Dayjs | null) => void
    onDateToChange: (date: Dayjs | null) => void
    availableDates: Dayjs[]
    onClearFilters: () => void
}

const SectorPeriodFilter = ({ 
    currentPeriod, 
    onFilterPeriod,
    dateFrom,
    dateTo,
    onDateFromChange,
    onDateToChange,
    availableDates,
    onClearFilters
}: SectorPeriodFilterProps) => {
    return (
        <Card className="mb-6">
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <PiCalendarDuotone className="text-2xl text-indigo-600" />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Filtros
                    </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Período */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Período
                        </label>
                        <select
                            value={currentPeriod || 'month'}
                            onChange={(e) => onFilterPeriod(e.target.value as PeriodFilter)}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                        >
                            <option value="week">Semanal</option>
                            <option value="month">Mensual</option>
                            <option value="quarter">Anual</option>
                        </select>
                    </div>

                    {/* Desde */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Desde
                        </label>
                        <MuiDateCalendarInput
                            value={dateFrom}
                            onChange={onDateFromChange}
                            availableDates={availableDates}
                            label=""
                        />
                    </div>

                    {/* Hasta */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Hasta
                        </label>
                        <MuiDateCalendarInput
                            value={dateTo}
                            onChange={onDateToChange}
                            availableDates={availableDates}
                            label=""
                        />
                    </div>

                    {/* Botón Limpiar */}
                    <div className="flex items-end">
                        <Button
                            variant="plain"
                            size="sm"
                            onClick={onClearFilters}
                            className="w-full"
                        >
                            Limpiar filtros
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default SectorPeriodFilter
