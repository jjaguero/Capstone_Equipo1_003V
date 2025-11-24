import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TelegramUserDocument = TelegramUser & Document;

@Schema({ timestamps: true })
export class TelegramUser {
    @Prop({ required: true, unique: true })
    telegramId: string;

    @Prop({ required: true })
    rut: string;

    @Prop()
    firstName?: string;

    @Prop()
    lastName?: string;

    @Prop()
    username?: string;

    @Prop({ default: Date.now })
    linkedAt: Date;
}

export const TelegramUserSchema = SchemaFactory.createForClass(TelegramUser);
