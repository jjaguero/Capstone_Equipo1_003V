/**
 * User entity matching backend MongoDB schema
 * Backend: api-nestjs-aquatracking/src/schemas/user.schema.ts
 */
export interface User {
  _id: string;
  rut: string;
  name: string;
  email: string;
  phone: string;
  password?: string; // Optional because backend won't return it in responses
  role: 'admin' | 'user';
  homeId?: string;
  avatar?: string;
  limitLitersPerDay?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
