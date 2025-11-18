import { useMemo } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

interface DayPickerDateInputProps {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  availableDates: Date[]
  label?: string
}

export default function DayPickerDateInput({ value, onChange, availableDates, label }: DayPickerDateInputProps) {

  const availableIsoDates = useMemo(() => availableDates.map(d => d.toISOString().slice(0, 10)), [availableDates])
  // Calcular rango mínimo y máximo para el calendario
  const fromDate = availableDates.length > 0 ? availableDates[0] : undefined
  const toDate = availableDates.length > 0 ? availableDates[availableDates.length - 1] : undefined
  return (
    <div>
      <style>{`.rdp .rdp-footer, .rdp-footer { display: none !important; }`}</style>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>}
      <DayPicker
        mode="single"
        selected={value}
        onSelect={onChange}
        disabled={(date: Date) => !availableIsoDates.includes(date.toISOString().slice(0, 10))}
        fromDate={fromDate}
        toDate={toDate}
        showOutsideDays={false}
        className="rounded-lg shadow border border-gray-300 dark:border-gray-600"
      />
    </div>
  )
}
