/**
 * Home entity matching backend MongoDB schema
 * Backend: api-nestjs-aquatracking/src/schemas/home.schema.ts
 */
export interface Home {
  _id: string;
  name: string;
  address: string;
  sectorId: string;
  ownerId?: string;
  active: boolean;
  members: number; // Number of members in the home
  createdAt?: Date;
  updatedAt?: Date;
}
