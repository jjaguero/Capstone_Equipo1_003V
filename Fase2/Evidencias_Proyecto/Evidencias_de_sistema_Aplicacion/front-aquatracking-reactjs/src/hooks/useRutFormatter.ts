import { useState, useCallback } from 'react'
import { formatRut, cleanRut } from '@/utils/rutFormatter'

interface UseRutFormatterReturn {
  displayValue: string
  rawValue: string
  handleChange: (value: string) => void
  reset: () => void
}

export const useRutFormatter = (initialValue: string = ''): UseRutFormatterReturn => {
  const [displayValue, setDisplayValue] = useState(() => {
    if (!initialValue) return ''
    const cleaned = cleanRut(initialValue)
    return formatRut(cleaned)
  })
  const [rawValue, setRawValue] = useState(() => {
    if (!initialValue) return ''
    const cleaned = cleanRut(initialValue)
    return cleaned.length > 1 ? cleaned.slice(0, -1) + '-' + cleaned.slice(-1) : cleaned
  })

  const handleChange = useCallback((value: string) => {
    const cleaned = cleanRut(value)
    if (cleaned.length > 9) return
    
    if (cleaned.length > 0) {
      const formatted = formatRut(cleaned)
      const rawForDb = cleaned.slice(0, -1) + '-' + cleaned.slice(-1)
      
      setDisplayValue(formatted)
      setRawValue(rawForDb)
    } else {
      setDisplayValue('')
      setRawValue('')
    }
  }, [])

  const reset = useCallback(() => {
    setDisplayValue('')
    setRawValue('')
  }, [])

  return {
    displayValue,
    rawValue,
    handleChange,
    reset,
  }
}