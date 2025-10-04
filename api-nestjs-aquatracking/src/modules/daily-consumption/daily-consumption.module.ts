import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyConsumptionService } from './daily-consumption.service';
import { DailyConsumptionController } from './daily-consumption.controller';
import { DailyConsumption, DailyConsumptionSchema } from '../../schemas/daily-consumption.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DailyConsumption.name, schema: DailyConsumptionSchema },
    ]),
  ],
  controllers: [DailyConsumptionController],
  providers: [DailyConsumptionService],
  exports: [DailyConsumptionService],
})
export class DailyConsumptionModule {}
