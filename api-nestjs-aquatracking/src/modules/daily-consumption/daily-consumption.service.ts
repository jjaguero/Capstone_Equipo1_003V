import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DailyConsumption, DailyConsumptionDocument } from '../../schemas/daily-consumption.schema';
import { Home, HomeDocument } from '../../schemas/home.schema';
import { CreateDailyConsumptionDto, UpdateDailyConsumptionDto } from './dto';

@Injectable()
export class DailyConsumptionService {
  constructor(
    @InjectModel(DailyConsumption.name) 
    private dailyConsumptionModel: Model<DailyConsumptionDocument>,
    @InjectModel(Home.name)
    private homeModel: Model<HomeDocument>,
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

  async getSystemTrends(days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let result = await this.dailyConsumptionModel.aggregate([
      { 
        $match: { 
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalConsumption: { $sum: "$totalLiters" },
          averagePerHome: { $avg: "$totalLiters" },
          homeCount: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Si no hay datos recientes, obtener los últimos datos disponibles
    if (!result.length) {
      result = await this.dailyConsumptionModel.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            totalConsumption: { $sum: "$totalLiters" },
            averagePerHome: { $avg: "$totalLiters" },
            homeCount: { $sum: 1 }
          }
        },
        { $sort: { "_id": -1 } },
        { $limit: days }
      ]);
    }

    // Mapear al formato esperado por el frontend
    return result.map(item => ({
      date: item._id,
      totalConsumption: item.totalConsumption,
      averagePerHome: item.averagePerHome
    }));
  }

  async getConsumptionDistribution(): Promise<any> {
    // Buscar los datos más recientes disponibles
    const consumptions = await this.dailyConsumptionModel.find()
      .sort({ date: -1 })
      .limit(240); // Últimos 240 registros (aprox. 24 días × 10 hogares)

    if (!consumptions.length) {
      // Si no hay datos, devolver distribución vacía
      return [
        { range: 'Bajo (0-50%)', count: 0, percentage: 0 },
        { range: 'Normal (50-80%)', count: 0, percentage: 0 },
        { range: 'Alto (80-100%)', count: 0, percentage: 0 },
        { range: 'Crítico (+100%)', count: 0, percentage: 0 }
      ];
    }

    // Categorizar los consumos
    const categories = {
      low: 0,    // 0-50%
      normal: 0, // 50-80%
      high: 0,   // 80-100%
      critical: 0 // +100%
    };

    let validRecords = 0;

    consumptions.forEach(consumption => {
      if (!consumption.limitLiters || consumption.limitLiters <= 0) {
        return;
      }

      const percentage = (consumption.totalLiters / consumption.limitLiters) * 100;
      validRecords++;

      if (percentage <= 50) categories.low++;
      else if (percentage <= 80) categories.normal++;
      else if (percentage <= 100) categories.high++;
      else categories.critical++;
    });

    const total = validRecords;
    
    return [
      {
        range: 'Bajo (0-50%)',
        count: categories.low,
        percentage: total > 0 ? Math.round((categories.low / total) * 100 * 100) / 100 : 0
      },
      {
        range: 'Normal (50-80%)',
        count: categories.normal,
        percentage: total > 0 ? Math.round((categories.normal / total) * 100 * 100) / 100 : 0
      },
      {
        range: 'Alto (80-100%)',
        count: categories.high,
        percentage: total > 0 ? Math.round((categories.high / total) * 100 * 100) / 100 : 0
      },
      {
        range: 'Crítico (+100%)',
        count: categories.critical,
        percentage: total > 0 ? Math.round((categories.critical / total) * 100 * 100) / 100 : 0
      }
    ];
  }

  async getHomesWithAlerts(): Promise<any> {
    // Obtener consumos de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const consumptions = await this.dailyConsumptionModel.find({
      date: { $gte: today }
    }).populate('homeId', 'name limitLitersPerDay');

    if (!consumptions.length) {
      return []; // No hay datos de hoy
    }

    const alerts: any[] = [];

    consumptions.forEach(consumption => {
      const home = consumption.homeId as any;
      if (!home || !home.limitLitersPerDay) return;

      const percentage = (consumption.totalLiters / home.limitLitersPerDay) * 100;

      // Solo incluir si excede el 80% del límite
      if (percentage >= 80) {
        alerts.push({
          homeId: home._id,
          homeName: home.name,
          consumption: consumption.totalLiters,
          limit: home.limitLitersPerDay,
          percentageUsed: percentage,
          status: percentage >= 100 ? 'critical' : 'warning'
        });
      }
    });

    // Ordenar por porcentaje de uso descendente
    return alerts.sort((a, b) => b.percentageUsed - a.percentageUsed);
  }
}
