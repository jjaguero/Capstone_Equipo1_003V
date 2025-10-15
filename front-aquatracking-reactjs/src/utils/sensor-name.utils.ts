/**
 * Utilidades para normalizar nombres de sensores
 */

import { SENSOR_LOCATIONS, SENSOR_SUBTYPES } from '@/features/sensors/constants/sensors.constant';

/**
 * Normaliza un nombre de sensor convirtiéndolo a un formato legible
 * @param sensorName - Nombre del sensor (ej: "baño_principal", "lavamanos")
 * @returns Nombre normalizado (ej: "Baño Principal", "Lavamanos")
 */
export const normalizeSensorName = (sensorName: string): string => {
  if (!sensorName) return '';

  // Buscar primero en las ubicaciones
  const location = SENSOR_LOCATIONS.find(l => l.value === sensorName);
  if (location) {
    return location.label;
  }

  // Buscar en los subtipos
  const subtype = SENSOR_SUBTYPES.find(s => s.value === sensorName);
  if (subtype) {
    return subtype.label;
  }

  // Si no se encuentra en las constantes, aplicar normalización automática
  return autoNormalizeName(sensorName);
};

/**
 * Normalización automática para nombres no definidos en constantes
 * Convierte snake_case a Title Case y maneja casos especiales
 */
const autoNormalizeName = (name: string): string => {
  return name
    // Reemplazar guiones bajos con espacios
    .replace(/_/g, ' ')
    // Capitalizar primera letra de cada palabra
    .replace(/\b\w+/g, (word) => {
      // Casos especiales
      const specialCases: Record<string, string> = {
        'de': 'de',
        'del': 'del',
        'la': 'la',
        'el': 'el',
        'y': 'y',
      };
      
      const lowerWord = word.toLowerCase();
      if (specialCases[lowerWord]) {
        return specialCases[lowerWord];
      }
      
      // Capitalizar primera letra
      return lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
    })
    // Casos especiales para palabras completas
    .replace(/\bJardin\b/g, 'Jardín')
    .replace(/\bBano\b/g, 'Baño');
};

/**
 * Obtiene el nombre completo de un sensor combinando ubicación y subtipo
 * @param location - Ubicación del sensor
 * @param subtype - Subtipo del sensor
 * @returns Nombre completo normalizado
 */
export const getFullSensorName = (location: string, subtype?: string): string => {
  const locationName = normalizeSensorName(location);
  
  if (!subtype) {
    return locationName;
  }
  
  const subtypeName = normalizeSensorName(subtype);
  return `${subtypeName} - ${locationName}`;
};

/**
 * Extrae la ubicación y subtipo de un nombre de sensor completo
 * @param fullName - Nombre completo del sensor
 * @returns Objeto con location y subtype extraídos
 */
export const parseSensorName = (fullName: string): { location?: string; subtype?: string } => {
  const parts = fullName.split(' - ');
  
  if (parts.length === 2) {
    const [subtypePart, locationPart] = parts;
    
    // Buscar coincidencias en las constantes
    const location = SENSOR_LOCATIONS.find(l => l.label === locationPart);
    const subtype = SENSOR_SUBTYPES.find(s => s.label === subtypePart);
    
    return {
      location: location?.value,
      subtype: subtype?.value
    };
  }
  
  // Si no tiene el formato esperado, intentar encontrar solo la ubicación
  const location = SENSOR_LOCATIONS.find(l => l.label === fullName);
  return {
    location: location?.value
  };
};