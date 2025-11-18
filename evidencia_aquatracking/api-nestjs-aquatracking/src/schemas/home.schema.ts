import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HomeDocument = Home & Document;

@Schema({ timestamps: true })
export class Home {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  sectorId: string;

  @Prop()
  ownerId?: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: 1 })
  members: number;
}

export const HomeSchema = SchemaFactory.createForClass(Home);
