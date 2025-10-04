import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DailyConsumption, DailyConsumptionDocument } from '../../schemas/daily-consumption.schema';
import { CreateDailyConsumptionDto, UpdateDailyConsumptionDto } from './dto';

@Injectable()
export class DailyConsumptionService {
  constructor(
    @InjectModel(DailyConsumption.name) 
    private dailyConsumptionModel: Model<DailyConsumptionDocument>,
  ) {}

  async create(createDailyConsumptionDto: CreateDailyConsumptionDto): Promise<DailyConsumption> {
    const createdConsumption = new this.dailyConsumptionModel(createDailyConsumptionDto);
    return await createdConsumption.save();
  }

  async findAll(): Promise<DailyConsumption[]> {
    return await this.dailyConsumptionModel.find().sort({ date: -1 }).exec();
  }

  async findOne(id: string): Promise<DailyConsumption> {
    const consumption = await this.dailyConsumptionModel.findById(id).exec();
    if (!consumption) {
      throw new NotFoundException(`Consumo diario con ID ${id} no encontrado`);
    }
    return consumption;
  }

  async findByHome(homeId: string, limit?: number): Promise<DailyConsumption[]> {
    const query = this.dailyConsumptionModel
      .find({ homeId })
      .sort({ date: -1 });
    
    if (limit) {
      query.limit(limit);
    }
    return await query.exec();
  }

  async findByDate(homeId: string, date: Date): Promise<DailyConsumption | null> {
    return await this.dailyConsumptionModel.findOne({ homeId, date }).exec();
  }

  async findByDateRange(
    homeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<DailyConsumption[]> {
    return await this.dailyConsumptionModel
      .find({
        homeId,
        date: { $gte: startDate, $lte: endDate },
      })
      .sort({ date: -1 })
      .exec();
  }

  async getWeeklyConsumption(homeId: string): Promise<DailyConsumption[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    return await this.findByDateRange(homeId, startDate, endDate);
  }

  async getMonthlyConsumption(homeId: string): Promise<DailyConsumption[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    return await this.findByDateRange(homeId, startDate, endDate);
  }

  async update(id: string, updateDailyConsumptionDto: UpdateDailyConsumptionDto): Promise<DailyConsumption> {
    const updatedConsumption = await this.dailyConsumptionModel
      .findByIdAndUpdate(id, updateDailyConsumptionDto, { new: true })
      .exec();
    
    if (!updatedConsumption) {
      throw new NotFoundException(`Consumo diario con ID ${id} no encontrado`);
    }
    return updatedConsumption;
  }

  async remove(id: string): Promise<void> {
    const result = await this.dailyConsumptionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Consumo diario con ID ${id} no encontrado`);
    }
  }

  async getTotalByHome(homeId: string): Promise<number> {
    const result = await this.dailyConsumptionModel.aggregate([
      { $match: { homeId } },
      { $group: { _id: null, total: { $sum: '$totalLiters' } } },
    ]);
    return result[0]?.total || 0;
  }

  async getAverageByHome(homeId: string): Promise<number> {
    const result = await this.dailyConsumptionModel.aggregate([
      { $match: { homeId } },
      { $group: { _id: null, average: { $avg: '$totalLiters' } } },
    ]);
    return result[0]?.average || 0;
  }
}
