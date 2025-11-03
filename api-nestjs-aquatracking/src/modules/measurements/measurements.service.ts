import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Measurement, MeasurementDocument } from '../../schemas/measurement.schema';
import { CreateMeasurementDto, UpdateMeasurementDto } from './dto';

@Injectable()
export class MeasurementsService {
  constructor(
    @InjectModel(Measurement.name) private measurementModel: Model<MeasurementDocument>,
  ) {}

  async create(createMeasurementDto: CreateMeasurementDto): Promise<Measurement> {
    const createdMeasurement = new this.measurementModel(createMeasurementDto);
    return await createdMeasurement.save();
  }

  async findAll(limit?: number): Promise<Measurement[]> {
    const query = this.measurementModel.find().sort({ startTime: -1 });
    if (limit) {
      query.limit(limit);
    }
    return await query.exec();
  }

  async findOne(id: string): Promise<Measurement> {
    const measurement = await this.measurementModel.findById(id).exec();
    if (!measurement) {
      throw new NotFoundException(`Medición con ID ${id} no encontrada`);
    }
    return measurement;
  }

  async findByHome(homeId: string, limit?: number): Promise<Measurement[]> {
    const query = this.measurementModel.find({ homeId }).sort({ startTime: -1 });
    if (limit) {
      query.limit(limit);
    }
    return await query.exec();
  }

  async findBySensor(sensorId: string, limit?: number): Promise<Measurement[]> {
    const query = this.measurementModel.find({ sensorId }).sort({ startTime: -1 });
    if (limit) {
      query.limit(limit);
    }
    return await query.exec();
  }

  async findByDateRange(
    homeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Measurement[]> {
    return await this.measurementModel
      .find({
        homeId,
        startTime: { $gte: startDate, $lte: endDate },
      })
      .sort({ startTime: -1 })
      .exec();
  }

  async update(id: string, updateMeasurementDto: UpdateMeasurementDto): Promise<Measurement> {
    const updatedMeasurement = await this.measurementModel
      .findByIdAndUpdate(id, updateMeasurementDto, { new: true })
      .exec();
    
    if (!updatedMeasurement) {
      throw new NotFoundException(`Medición con ID ${id} no encontrada`);
    }
    return updatedMeasurement;
  }

  async remove(id: string): Promise<void> {
    const result = await this.measurementModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Medición con ID ${id} no encontrada`);
    }
  }

  async count(): Promise<number> {
    return await this.measurementModel.countDocuments().exec();
  }

  async sumLitersByHome(homeId: string): Promise<number> {
    const result = await this.measurementModel.aggregate([
      { $match: { homeId } },
      { $group: { _id: null, total: { $sum: '$liters' } } },
    ]);
    return result[0]?.total || 0;
  }

  // 🆕 Consumo por hora del día actual para un sensor
  async getHourlyConsumptionToday(sensorId: string): Promise<any[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await this.measurementModel.aggregate([
      {
        $match: {
          sensorId,
          startTime: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: {
            $hour: '$startTime',
          },
          liters: { $sum: '$liters' },
          count: { $sum: 1 },
          avgDuration: { $avg: '$durationSec' },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          hour: '$_id',
          liters: 1,
          count: 1,
          avgDuration: 1,
          _id: 0,
        },
      },
    ]);
  }

  async getTodayConsumption(sensorId: string): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await this.measurementModel.aggregate([
      {
        $match: {
          sensorId,
          startTime: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: null,
          totalLiters: { $sum: '$liters' },
          count: { $sum: 1 },
          avgDuration: { $avg: '$durationSec' },
          minStartTime: { $min: '$startTime' },
          maxEndTime: { $max: '$endTime' },
        },
      },
    ]);

    return result[0] || { totalLiters: 0, count: 0, avgDuration: 0 };
  }

  // 🆕 Últimas mediciones de un sensor
  async getRecentMeasurements(sensorId: string, limit: number = 10): Promise<Measurement[]> {
    return await this.measurementModel
      .find({ sensorId })
      .sort({ startTime: -1 })
      .limit(limit)
      .exec();
  }

  // 🆕 Consumo por día (últimos 7 días)
  async getLast7DaysConsumption(sensorId: string): Promise<any[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    return await this.measurementModel.aggregate([
      {
        $match: {
          sensorId,
          startTime: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$startTime' },
          },
          liters: { $sum: '$liters' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          date: '$_id',
          liters: 1,
          count: 1,
          _id: 0,
        },
      },
    ]);
  }
}
