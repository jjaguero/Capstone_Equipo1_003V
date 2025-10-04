/**
 * API endpoints for NestJS backend
 * Simple string constants - NO business logic
 * Matches backend routes from api-nestjs-aquatracking
 */

export const ENDPOINTS = {
  // Server session endpoint
  SERVER_SESSION: '/server-session',

  // Users endpoints
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
  USER_BY_EMAIL: (email: string) => `/users/email/${email}`,
  USER_BY_RUT: (rut: string) => `/users/rut/${rut}`,

  // Sectors endpoints
  SECTORS: '/sectors',
  SECTOR_BY_ID: (id: string) => `/sectors/${id}`,

  // Homes endpoints
  HOMES: '/homes',
  HOME_BY_ID: (id: string) => `/homes/${id}`,
  HOMES_BY_SECTOR: (sectorId: string) => `/homes/sector/${sectorId}`,

  // Sensors endpoints
  SENSORS: '/sensors',
  SENSOR_BY_ID: (id: string) => `/sensors/${id}`,
  SENSORS_BY_HOME: (homeId: string) => `/sensors/home/${homeId}`,

  // Measurements endpoints
  MEASUREMENTS: '/measurements',
  MEASUREMENT_BY_ID: (id: string) => `/measurements/${id}`,
  MEASUREMENTS_BY_HOME: (homeId: string) => `/measurements/home/${homeId}`,
  MEASUREMENTS_BY_SENSOR: (sensorId: string) => `/measurements/sensor/${sensorId}`,

  // Daily consumption endpoints
  DAILY_CONSUMPTION: '/daily-consumption',
  DAILY_CONSUMPTION_BY_ID: (id: string) => `/daily-consumption/${id}`,
  DAILY_CONSUMPTION_BY_HOME: (homeId: string) => `/daily-consumption/home/${homeId}`,

  // Alerts endpoints
  ALERTS: '/alerts',
  ALERT_BY_ID: (id: string) => `/alerts/${id}`,
  ALERTS_BY_HOME: (homeId: string) => `/alerts/home/${homeId}`,
  UNRESOLVED_ALERTS_BY_HOME: (homeId: string) => `/alerts/home/${homeId}/unresolved`,
} as const;

export default ENDPOINTS;
