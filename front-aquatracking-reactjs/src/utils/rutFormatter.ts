export const formatRut = (rut: string): string => {
  // Limpiar todo excepto números y K
  const onlyNumbersAndK = rut.replace(/[^0-9kK]/g, '').toUpperCase()
  
  if (onlyNumbersAndK.length < 2) return onlyNumbersAndK
  
  // Separar cuerpo y dígito verificador
  const body = onlyNumbersAndK.slice(0, -1)
  const dv = onlyNumbersAndK.slice(-1)
  
  // Formatear el cuerpo con puntos cada 3 dígitos
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  
  return `${formattedBody}-${dv}`
}

export const cleanRut = (rut: string): string => {
  // Solo permitir números y K/k (para validar longitud)
  return rut.replace(/[^0-9kK]/g, '').toUpperCase()
}

export const validateRut = (rut: string): boolean => {
  const cleaned = cleanRut(rut)
  
  if (cleaned.length < 2) return false
  
  const body = cleaned.slice(0, -1)
  const dv = cleaned.slice(-1).toUpperCase()
  
  let sum = 0
  let multiplier = 2
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }
  
  const remainder = sum % 11
  const calculatedDv = 11 - remainder
  
  let expectedDv: string
  if (calculatedDv === 11) {
    expectedDv = '0'
  } else if (calculatedDv === 10) {
    expectedDv = 'K'
  } else {
    expectedDv = calculatedDv.toString()
  }
  
  return dv === expectedDv
}
