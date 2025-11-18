import { Dayjs } from 'dayjs'
import { MdFilterList } from 'react-icons/md'
import MuiDateCalendarInput from '@/components/shared/MuiDateCalendarInput'
import Button from '@/components/ui/Button'
import { Sensor } from '@/@types/entities/sensor.type'

interface ConsumptionFiltersProps {
  timePeriod: 'Weekly' | 'Monthly' | 'Annually'
  onTimePeriodChange: (value: 'Weekly' | 'Monthly' | 'Annually') => void
  dateFrom: Dayjs | null
  dateTo: Dayjs | null
  onDateFromChange: (date: Dayjs | null) => void
  onDateToChange: (date: Dayjs | null) => void
  selectedSensorId: string | null
  onSelectedSensorIdChange: (value: string | null) => void
  sensors: Sensor[]
  onClearFilters: () => void
  availableDates: Dayjs[]
}

export const ConsumptionFilters = ({
  timePeriod,
  onTimePeriodChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  selectedSensorId,
  onSelectedSensorIdChange,
  sensors,
  onClearFilters,
  availableDates,
}: ConsumptionFiltersProps) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center gap-2">
        <MdFilterList className="text-xl text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Filtros
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Período
          </label>
          <select
            value={timePeriod}
            onChange={(e) =>
              onTimePeriodChange(e.target.value as 'Weekly' | 'Monthly' | 'Annually')
            }
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="Weekly">Semanal</option>
            <option value="Monthly">Mensual</option>
            <option value="Annually">Anual</option>
          </select>
        </div>

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

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Sensor
          </label>
          <select
            value={selectedSensorId || ''}
            onChange={(e) => onSelectedSensorIdChange(e.target.value || null)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="">Todos los sensores</option>
            {sensors.map((s) => (
              <option key={s._id} value={s._id}>
                {s.serialNumber}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button size="sm" variant="plain" onClick={onClearFilters}>
          Limpiar filtros
        </Button>
      </div>
    </div>
  )
}
