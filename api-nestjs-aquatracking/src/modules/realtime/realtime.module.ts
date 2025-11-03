import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RealtimeGateway } from './realtime.gateway';
import { DataSimulatorService } from './data-simulator.service';
import {
  DailyConsumption,
  DailyConsumptionSchema,
} from '../../schemas/daily-consumption.schema';
import {
  Measurement,
  MeasurementSchema,
} from '../../schemas/measurement.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DailyConsumption.name, schema: DailyConsumptionSchema },
      { name: Measurement.name, schema: MeasurementSchema },
    ]),
  ],
  providers: [RealtimeGateway, DataSimulatorService],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
