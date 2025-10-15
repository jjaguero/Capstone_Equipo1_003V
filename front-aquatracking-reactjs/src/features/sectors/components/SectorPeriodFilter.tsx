import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import { PiCalendarDuotone } from 'react-icons/pi'

type PeriodFilter = 'week' | 'month' | 'quarter' | null

interface SectorPeriodFilterProps {
    currentPeriod: PeriodFilter
    onFilterPeriod: (period: PeriodFilter) => void
}

const SectorPeriodFilter = ({ currentPeriod, onFilterPeriod }: SectorPeriodFilterProps) => {
    const periodOptions = [
        { value: 'week', label: 'Última semana' },
        { value: 'month', label: 'Último mes' },
        { value: 'quarter', label: 'Últimos 3 meses' },
    ]

    const handlePeriodChange = (value: string) => {
        onFilterPeriod(value as PeriodFilter)
    }

    return (
        <Card className="mb-6">
            <div className="flex items-center gap-4">
                <PiCalendarDuotone className="text-2xl text-gray-600" />
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Período de análisis
                    </label>
                    <Select
                        value={periodOptions.find(opt => opt.value === currentPeriod)}
                        options={periodOptions}
                        onChange={(option) => handlePeriodChange(option?.value || 'month')}
                        placeholder="Seleccionar período"
                    />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="font-medium">Comparando sectores</p>
                    <p className="text-xs">
                        {currentPeriod === 'week' && 'Últimos 7 días'}
                        {currentPeriod === 'month' && 'Últimos 30 días'}
                        {currentPeriod === 'quarter' && 'Últimos 90 días'}
                    </p>
                </div>
            </div>
        </Card>
    )
}

export default SectorPeriodFilter
