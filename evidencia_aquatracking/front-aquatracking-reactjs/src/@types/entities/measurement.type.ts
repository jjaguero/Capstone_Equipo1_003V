/**
 * Measurement entity matching backend MongoDB schema
 * Backend: api-nestjs-aquatracking/src/schemas/measurement.schema.ts
 */
export interface Measurement {
  _id: string;
  sensorId: string;
  homeId: string;
  startTime: Date;
  endTime: Date;
  liters: number;
  durationSec: number;
  unit: string;
  createdAt?: Date;
}
