import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { TelegramUser, TelegramUserSchema } from '../../schemas/telegram-user.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { DailyConsumption, DailyConsumptionSchema } from '../../schemas/daily-consumption.schema';
import { Sensor, SensorSchema } from '../../schemas/sensor.schema';
import { Alert, AlertSchema } from '../../schemas/alert.schema';
import { Home, HomeSchema } from '../../schemas/home.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TelegramUser.name, schema: TelegramUserSchema },
      { name: User.name, schema: UserSchema },
      { name: DailyConsumption.name, schema: DailyConsumptionSchema },
      { name: Sensor.name, schema: SensorSchema },
      { name: Alert.name, schema: AlertSchema },
      { name: Home.name, schema: HomeSchema },
    ]),
  ],
  controllers: [ChatbotController],
  providers: [ChatbotService],
})
export class ChatbotModule { }