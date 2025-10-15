import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SensorDocument = Sensor & Document;

@Schema({ timestamps: true })
export class Sensor {
  @Prop({ required: true })
  homeId: string;

  @Prop({ required: true, unique: true })
  serialNumber: string;

  @Prop({ required: true, default: 'flow' })
  category: string;

  @Prop()
  subType?: string;

  @Prop({ required: true })
  location: string;

  @Prop({ default: Date.now })
  installedAt: Date;

  @Prop({ required: true, enum: ['active', 'inactive', 'maintenance', 'absent'], default: 'active' })
  status: string;

  @Prop({ type: [String], default: ['litros'] })
  tags: string[];
}

export const SensorSchema = SchemaFactory.createForClass(Sensor);
