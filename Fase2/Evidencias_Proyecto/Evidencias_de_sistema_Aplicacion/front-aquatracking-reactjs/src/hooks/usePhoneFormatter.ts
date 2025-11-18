import { useState, useCallback } from 'react'

interface UsePhoneFormatterReturn {
  displayValue: string
  rawValue: string
  handleChange: (value: string) => void
  reset: () => void
}

export const usePhoneFormatter = (initialValue: string = ''): UsePhoneFormatterReturn => {
  const [displayValue, setDisplayValue] = useState(() => {
    if (!initialValue) return '+56 9 '
    // Si el valor ya viene con +569, extraer solo los números después del código
    if (initialValue.startsWith('+569')) {
      const numbers = initialValue.slice(4) // Salta +569
      return formatChileanPhone(numbers)
    }
    // Si solo tiene números, formatearlos
    const numbersOnly = initialValue.replace(/[^0-9]/g, '')
    return formatChileanPhone(numbersOnly)
  })
  const [rawValue, setRawValue] = useState(() => {
    if (!initialValue) return ''
    // Si ya tiene el formato correcto, devolverlo tal cual
    if (initialValue.startsWith('+569')) {
      return initialValue
    }
    // Si no, limpiarlo y agregar el prefijo
    const numbersOnly = initialValue.replace(/[^0-9]/g, '')
    return numbersOnly.length > 0 ? `+569${numbersOnly}` : ''
  })

  const handleChange = useCallback((value: string) => {
    if (value.length < 6 || !value.startsWith('+56 9')) {
      setDisplayValue('+56 9 ')
      setRawValue('')
      return
    }
    const numbersOnly = value.slice(6).replace(/[^0-9]/g, '')
    
    if (numbersOnly.length > 8) return
    
    const formatted = formatChileanPhone(numbersOnly)
    const rawForDb = numbersOnly.length > 0 ? `+569${numbersOnly}` : ''
    
    setDisplayValue(formatted)
    setRawValue(rawForDb)
  }, [])

  const reset = useCallback(() => {
    setDisplayValue('+56 9 ')
    setRawValue('')
  }, [])

  return {
    displayValue,
    rawValue,
    handleChange,
    reset,
  }
}

const cleanPhone = (phone: string): string => {
  return phone.replace(/[^0-9+]/g, '')
}
const formatChileanPhone = (numbers: string): string => {
  if (numbers.length === 0) return '+56 9 '
  if (numbers.length <= 4) return `+56 9 ${numbers}`
  return `+56 9 ${numbers.slice(0, 4)} ${numbers.slice(4)}`
}