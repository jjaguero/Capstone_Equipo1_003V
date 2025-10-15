import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MeasurementDocument = Measurement & Document;

@Schema({ timestamps: true })
export class Measurement {
  @Prop({ required: true })
  sensorId: string;

  @Prop({ required: true })
  homeId: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ required: true })
  liters: number;

  @Prop({ required: true })
  durationSec: number;

  @Prop({ default: 'L' })
  unit: string;
}

export const MeasurementSchema = SchemaFactory.createForClass(Measurement);

// Índices para optimizar consultas
MeasurementSchema.index({ homeId: 1, startTime: -1 });
MeasurementSchema.index({ sensorId: 1, startTime: -1 });
