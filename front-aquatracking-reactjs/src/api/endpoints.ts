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
  SENSORS_BY_HOME: (homeId: string) => `/sensors?homeId=${homeId}`,

  // Measurements endpoints
  MEASUREMENTS: '/measurements',
  MEASUREMENT_BY_ID: (id: string) => `/measurements/${id}`,
  MEASUREMENTS_BY_HOME: (homeId: string) => `/measurements?homeId=${homeId}`,
  MEASUREMENTS_BY_SENSOR: (sensorId: string) => `/measurements?sensorId=${sensorId}`,

  // Daily consumption endpoints
  DAILY_CONSUMPTION: '/daily-consumption',
  DAILY_CONSUMPTION_BY_ID: (id: string) => `/daily-consumption/${id}`,
  DAILY_CONSUMPTION_BY_HOME: (homeId: string) => `/daily-consumption?homeId=${homeId}`,

  // Alerts endpoints
  ALERTS: '/alerts',
  ALERT_BY_ID: (id: string) => `/alerts/${id}`,
  ALERTS_BY_HOME: (homeId: string) => `/alerts?homeId=${homeId}`,
  UNRESOLVED_ALERTS_BY_HOME: (homeId: string) => `/alerts?homeId=${homeId}&resolved=false`,

  // Support tickets endpoints
  SUPPORT_TICKETS: '/support',
  SUPPORT_TICKET_BY_ID: (id: string) => `/support/${id}`,
  SUPPORT_TICKETS_BY_USER: (userId: string) => `/support/user/${userId}`,
  SUPPORT_TICKETS_BY_HOME: (homeId: string) => `/support/home/${homeId}`,
  SUPPORT_TICKETS_BY_SENSOR: (sensorId: string) => `/support/sensor/${sensorId}`,
  SUPPORT_TICKETS_BY_STATUS: (status: string) => `/support?status=${status}`,
  SUPPORT_TICKET_STATS: '/support/stats',
  SUPPORT_TICKET_ADD_COMMENT: (id: string) => `/support/${id}/comments`,
  SUPPORT_TICKET_ASSIGN: (id: string, adminId: string) => `/support/${id}/assign/${adminId}`,
} as const;

export default ENDPOINTS;
