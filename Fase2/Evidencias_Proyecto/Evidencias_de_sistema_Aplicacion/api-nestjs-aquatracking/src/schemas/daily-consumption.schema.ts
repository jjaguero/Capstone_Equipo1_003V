import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

class BySensor {
  @Prop({ required: true })
  sensorId: string;

  @Prop({ required: true })
  liters: number;
}

class DailyAlert {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  triggeredAt: Date;
}

export type DailyConsumptionDocument = DailyConsumption & Document;

@Schema({ timestamps: true, collection: 'dailyconsumptions' })
export class DailyConsumption {
  @Prop({ required: true })
  homeId: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, default: 0 })
  totalLiters: number;

  @Prop({ type: [BySensor], default: [] })
  bySensor: BySensor[];

  @Prop({ default: 0 })
  recommendedLiters: number;

  @Prop({ default: 0 })
  limitLiters: number;

  @Prop({ type: [DailyAlert], default: [] })
  alerts: DailyAlert[];
}

export const DailyConsumptionSchema = SchemaFactory.createForClass(DailyConsumption);

DailyConsumptionSchema.index({ homeId: 1, date: 1 }, { unique: true });
