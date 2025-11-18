/**
 * DailyConsumption entity matching backend MongoDB schema
 * Backend: api-nestjs-aquatracking/src/schemas/daily-consumption.schema.ts
 */
export interface BySensorConsumption {
  sensorId: string;
  liters: number;
}

export interface AlertReference {
  alertId: string;
  type: string;
}

export interface DailyConsumption {
  _id: string;
  homeId: string;
  date: string; // ISO format "YYYY-MM-DD"
  totalLiters: number;
  bySensor: BySensorConsumption[];
  recommendedLiters?: number;
  limitLiters?: number;
  alerts?: AlertReference[];
  createdAt?: Date;
  updatedAt?: Date;
}
