export const SENSOR_LOCATIONS = [
  { value: 'baño_principal', label: 'Baño Principal' },
  { value: 'baño_secundario', label: 'Baño Secundario' },
  { value: 'cocina', label: 'Cocina' },
  { value: 'loggia', label: 'Loggia' },
  { value: 'patio', label: 'Patio' },
  { value: 'jardin', label: 'Jardín' },
]

export const SENSOR_SUBTYPES = [
  { value: 'ducha', label: 'Ducha' },
  { value: 'lavamanos', label: 'Lavamanos' },
  { value: 'inodoro', label: 'Inodoro' },
  { value: 'lavaplatos', label: 'Lavaplatos' },
  { value: 'lavadora', label: 'Lavadora' },
  { value: 'llave_jardin', label: 'Llave de Jardín' },
  { value: 'llave_patio', label: 'Llave de Patio' },
]

export const SENSOR_STATUS = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'maintenance', label: 'Mantenimiento' },
]

export const LOCATION_SENSOR_MAP: Record<string, string[]> = {
  'baño_principal': ['ducha', 'lavamanos', 'inodoro'],
  'baño_secundario': ['ducha', 'lavamanos', 'inodoro'],
  'cocina': ['lavaplatos'],
  'loggia': ['lavadora'],
  'patio': ['llave_patio'],
  'jardin': ['llave_jardin'],
}

export const getAvailableSensorTypes = (location: string) => {
  const allowedTypes = LOCATION_SENSOR_MAP[location] || []
  return SENSOR_SUBTYPES.filter(sensor => allowedTypes.includes(sensor.value))
}

export const getStatusLabel = (status: string) => {
  const statusItem = SENSOR_STATUS.find(s => s.value === status)
  return statusItem?.label || status
}


export const getLocationLabel = (location: string) => {
  const locationItem = SENSOR_LOCATIONS.find(l => l.value === location)
  return locationItem?.label || location
}


export const getSensorTypeLabel = (subType: string) => {
  const sensorItem = SENSOR_SUBTYPES.find(s => s.value === subType)
  return sensorItem?.label || subType
}
