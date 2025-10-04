/**
 * Sector entity matching backend MongoDB schema
 * Backend: api-nestjs-aquatracking/src/schemas/sector.schema.ts
 */
export interface Sector {
  _id: string;
  name: string;
  aprName?: string;
  region?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
