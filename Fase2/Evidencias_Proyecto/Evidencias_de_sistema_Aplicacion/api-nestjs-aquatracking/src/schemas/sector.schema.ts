import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SectorDocument = Sector & Document;

@Schema({ timestamps: true })
export class Sector {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  aprName: string;

  @Prop({ required: true })
  region: string;

  @Prop({ default: true })
  active: boolean;
}

export const SectorSchema = SchemaFactory.createForClass(Sector);
