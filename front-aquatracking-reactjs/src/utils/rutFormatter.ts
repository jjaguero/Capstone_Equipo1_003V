export const formatRut = (rut: string): string => {
  const cleaned = rut.replace(/[^0-9kK]/g, '')
  
  if (cleaned.length < 2) return cleaned
  
  const body = cleaned.slice(0, -1)
  const dv = cleaned.slice(-1).toUpperCase()
  
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  
  return `${formattedBody}-${dv}`
}

export const cleanRut = (rut: string): string => {
  return rut.replace(/[^0-9kK]/g, '')
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
