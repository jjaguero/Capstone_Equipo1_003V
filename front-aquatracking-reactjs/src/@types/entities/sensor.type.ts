/**
 * Sensor entity matching backend MongoDB schema
 * Backend: api-nestjs-aquatracking/src/schemas/sensor.schema.ts
 */
export interface Sensor {
  _id: string;
  homeId: string;
  serialNumber: string;
  category: string;
  subType?: string;
  location?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'absent';
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
