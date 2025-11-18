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
  people?: number; // Número de personas en el hogar
  createdAt?: Date;
  updatedAt?: Date;
}
