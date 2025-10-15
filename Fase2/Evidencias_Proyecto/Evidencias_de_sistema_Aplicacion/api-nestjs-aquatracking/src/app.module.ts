import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { SectorsModule } from './modules/sectors/sectors.module';
import { HomesModule } from './modules/homes/homes.module';
import { SensorsModule } from './modules/sensors/sensors.module';
import { MeasurementsModule } from './modules/measurements/measurements.module';
import { DailyConsumptionModule } from './modules/daily-consumption/daily-consumption.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    SectorsModule,
    HomesModule,
    SensorsModule,
    MeasurementsModule,
    DailyConsumptionModule,
    AlertsModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
