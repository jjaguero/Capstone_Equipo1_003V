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
}
