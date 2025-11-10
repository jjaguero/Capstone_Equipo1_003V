import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SupportTicketDocument = SupportTicket & Document;

@Schema({ timestamps: true })
export class SupportTicket {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId | any; // Usuario que reporta (con populate)

  @Prop({ required: true })
  homeId: string; // Hogar relacionado

  @Prop({ required: false })
  sensorId?: string; // Sensor con problema (opcional)

  @Prop({ required: true })
  subject: string; // Asunto del ticket

  @Prop({ required: true })
  description: string; // Descripción detallada

  @Prop({ 
    required: true, 
    enum: ['sensor_issue', 'sensor_maintenance_request', 'high_consumption', 'leak_detection', 'general_inquiry', 'other'],
    default: 'other'
  })
  category: string; // Categoría del problema

  @Prop({ 
    required: true, 
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  })
  status: string; // Estado del ticket

  @Prop({ 
    required: true, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  })
  priority: string; // Prioridad

  @Prop({ required: false })
  assignedTo?: string; // Admin asignado (opcional)

  @Prop({ type: [String], default: [] })
  attachments: string[]; // URLs de archivos adjuntos

  @Prop({ type: [Object], default: [] })
  comments: Array<{
    userId: string;
    userName: string;
    userRole: string;
    message: string;
    timestamp: Date;
  }>; // Conversación del ticket

  @Prop({ required: false })
  resolvedAt?: Date; // Fecha de resolución

  @Prop({ required: false })
  closedAt?: Date; // Fecha de cierre
}

export const SupportTicketSchema = SchemaFactory.createForClass(SupportTicket);

// Índices para consultas eficientes
SupportTicketSchema.index({ userId: 1, status: 1 });
SupportTicketSchema.index({ homeId: 1 });
SupportTicketSchema.index({ sensorId: 1 });
SupportTicketSchema.index({ status: 1, priority: -1 });
SupportTicketSchema.index({ createdAt: -1 });
