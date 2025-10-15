/**
 * Alert entity matching backend MongoDB schema
 * Backend: api-nestjs-aquatracking/src/schemas/alert.schema.ts
 */
export interface Alert {
  _id: string;
  homeId: string;
  type: string;
  message: string;
  triggeredAt: Date;
  resolved: boolean;
  createdAt?: Date;
}
