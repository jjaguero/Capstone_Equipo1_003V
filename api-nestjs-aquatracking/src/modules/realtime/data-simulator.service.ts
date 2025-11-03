import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RealtimeGateway } from './realtime.gateway';
import { DailyConsumption } from '../../schemas/daily-consumption.schema';
import { Measurement } from '../../schemas/measurement.schema';

@Injectable()
export class DataSimulatorService implements OnModuleInit {
  private logger: Logger = new Logger('DataSimulatorService');
  private currentSimulatedDate: Date;
  private simulationInterval: NodeJS.Timeout;
  private isSimulating: boolean = false;
  private readonly START_DATE = new Date('2024-11-13T00:00:00.000Z');
  private readonly END_DATE = new Date();

  constructor(
    @InjectModel(DailyConsumption.name)
    private dailyConsumptionModel: Model<DailyConsumption>,
    @InjectModel(Measurement.name)
    private measurementModel: Model<Measurement>,
    private realtimeGateway: RealtimeGateway,
  ) {
    this.currentSimulatedDate = new Date(this.START_DATE);
    this.END_DATE.setHours(23, 59, 59, 999);
  }

  onModuleInit() {
    this.logger.log('DataSimulator initialized - Ready to start simulation');
    this.logger.log(`Simulating from ${this.START_DATE.toLocaleDateString('es-ES')} to ${this.END_DATE.toLocaleDateString('es-ES')}`);
    this.startSimulation();
  }

  startSimulation() {
    if (this.isSimulating) {
      this.logger.warn('Simulation already running');
      return;
    }

    this.isSimulating = true;
    this.logger.log(
      `Starting simulation from ${this.currentSimulatedDate.toISOString()}`,
    );

    this.simulationInterval = setInterval(async () => {
      await this.emitDailyData();
    }, 10000);
  }

  stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.isSimulating = false;
      this.logger.log('Simulation stopped');
    }
  }

  private async emitDailyData() {
    try {
      const startOfDay = new Date(this.currentSimulatedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(this.currentSimulatedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const dailyData = await this.dailyConsumptionModel
        .find({
          date: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        })
        .populate('homeId')
        .lean();

      const measurements = await this.measurementModel
        .find({
          timestamp: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        })
        .populate('sensorId')
        .lean();

      if (dailyData.length > 0 || measurements.length > 0) {
        const payload = {
          date: this.currentSimulatedDate.toISOString(),
          dailyConsumptions: dailyData,
          measurements: measurements,
          simulatedDate: this.currentSimulatedDate.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          }),
        };

        this.realtimeGateway.emitNewDailyData(payload);

        this.logger.log(
          `Emitted data for ${payload.simulatedDate} - ${dailyData.length} consumptions, ${measurements.length} measurements`,
        );
      } else {
        this.logger.warn(
          `No data found for ${this.currentSimulatedDate.toLocaleDateString('es-ES')}`,
        );
      }

      this.currentSimulatedDate.setDate(this.currentSimulatedDate.getDate() + 1);

      if (this.currentSimulatedDate > this.END_DATE) {
        this.logger.log(`Reached current date (${this.END_DATE.toLocaleDateString('es-ES')}), restarting simulation`);
        this.currentSimulatedDate = new Date(this.START_DATE);
      }
    } catch (error) {
      this.logger.error('Error emitting daily data:', error);
    }
  }

  getCurrentSimulatedDate(): Date {
    return this.currentSimulatedDate;
  }

  resetSimulation() {
    this.currentSimulatedDate = new Date(this.START_DATE);
    this.logger.log(`Simulation reset to ${this.START_DATE.toLocaleDateString('es-ES')}`);
  }
}
