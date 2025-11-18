import React from 'react'
import ReactDatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface DatePickerInputProps {
  value: Date | null
  onChange: (date: Date | null) => void
  availableDates: Date[]
  label?: string
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({ value, onChange, availableDates, label }) => {
  // Solo permitir fechas exactas
  const isDateAvailable = (date: Date) => {
    return availableDates.some(
      (d) => d.toISOString().slice(0, 10) === date.toISOString().slice(0, 10)
    )
  }

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>}
      <ReactDatePicker
        selected={value}
        onChange={onChange}
        filterDate={isDateAvailable}
        dateFormat="dd/MM/yyyy"
        placeholderText="Selecciona una fecha"
        className="w-full border rounded px-2 py-1"
        showPopperArrow={false}
        isClearable={false}
      />
    </div>
  )
}

export default DatePickerInput
