import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyConsumptionService } from './daily-consumption.service';
import { DailyConsumptionController } from './daily-consumption.controller';
import { DailyConsumption, DailyConsumptionSchema } from '../../schemas/daily-consumption.schema';
import { Home, HomeSchema } from '../../schemas/home.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DailyConsumption.name, schema: DailyConsumptionSchema },
      { name: Home.name, schema: HomeSchema },
    ]),
  ],
  controllers: [DailyConsumptionController],
  providers: [DailyConsumptionService],
  exports: [DailyConsumptionService],
})
export class DailyConsumptionModule {}
