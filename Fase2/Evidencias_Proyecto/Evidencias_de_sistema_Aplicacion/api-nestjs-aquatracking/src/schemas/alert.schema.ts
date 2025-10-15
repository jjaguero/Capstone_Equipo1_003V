import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AlertDocument = Alert & Document;

@Schema({ timestamps: true })
export class Alert {
  @Prop({ required: true })
  homeId: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, default: Date.now })
  triggeredAt: Date;

  @Prop({ default: false })
  resolved: boolean;
}

export const AlertSchema = SchemaFactory.createForClass(Alert);

// Índice para consultas rápidas por casa
AlertSchema.index({ homeId: 1, triggeredAt: -1 });
