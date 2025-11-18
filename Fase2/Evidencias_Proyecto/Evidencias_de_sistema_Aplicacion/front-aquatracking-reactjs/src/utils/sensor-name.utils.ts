/**
 * Utilidades para normalizar nombres de sensores
 */

import { SENSOR_LOCATIONS, SENSOR_SUBTYPES } from '@/features/user/sensors/constants/sensors.constant';

/**
 * Normaliza un nombre de sensor convirtiéndolo a un formato legible
 * @param sensorName - Nombre del sensor (ej: "baño_principal", "lavamanos")
 * @returns Nombre normalizado (ej: "Baño Principal", "Lavamanos")
 */
export const normalizeSensorName = (sensorName: string): string => {
  if (!sensorName) return '';

  // Buscar primero en las ubicaciones (case-insensitive)
  const location = SENSOR_LOCATIONS.find(l => 
    l.value === sensorName || l.label.toLowerCase() === sensorName.toLowerCase()
  );
  if (location) {
    return location.label;
  }

  // Buscar en los subtipos (case-insensitive)
  const subtype = SENSOR_SUBTYPES.find(s => 
    s.value === sensorName || s.label.toLowerCase() === sensorName.toLowerCase()
  );
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
  // Primero corregir casos problemáticos específicos antes de procesar (case-insensitive)
  let normalized = name
    .replace(/BañO/gi, 'Baño')
    .replace(/LoggiA/gi, 'Loggia')
    .replace(/Loggía/gi, 'Loggia')
    .toLowerCase()
    // Reemplazar guiones bajos con espacios
    .replace(/_/g, ' ');
  
  // Capitalizar primera letra de cada palabra
  normalized = normalized.replace(/\b\w+/g, (word) => {
    // Casos especiales que deben permanecer en minúscula
    const specialCases: Record<string, string> = {
      'de': 'de',
      'del': 'del',
      'la': 'la',
      'el': 'el',
      'y': 'y',
    };
    
    if (specialCases[word]) {
      return specialCases[word];
    }
    
    // Capitalizar primera letra solamente
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  
  // Casos especiales para palabras con acentos/caracteres especiales (final cleanup)
  return normalized
    .replace(/\bjardin\b/gi, 'Jardín')
    .replace(/\bloggia\b/gi, 'Loggia');
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