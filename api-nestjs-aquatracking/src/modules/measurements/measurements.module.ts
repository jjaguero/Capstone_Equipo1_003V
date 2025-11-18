import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MeasurementsService } from './measurements.service';
import { MeasurementsController } from './measurements.controller';
import { Measurement, MeasurementSchema } from '../../schemas/measurement.schema';
import { Sensor, SensorSchema } from '../../schemas/sensor.schema';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Measurement.name, schema: MeasurementSchema },
      { name: Sensor.name, schema: SensorSchema },
    ]),
    forwardRef(() => RealtimeModule),
  ],
  controllers: [MeasurementsController],
  providers: [MeasurementsService],
  exports: [MeasurementsService],
})
export class MeasurementsModule {}
