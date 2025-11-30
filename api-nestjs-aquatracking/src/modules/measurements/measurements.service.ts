import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Measurement, MeasurementDocument } from '../../schemas/measurement.schema';
import { Sensor, SensorDocument } from '../../schemas/sensor.schema';
import { DailyConsumption, DailyConsumptionDocument } from '../../schemas/daily-consumption.schema';
import { CreateMeasurementDto, UpdateMeasurementDto } from './dto';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class MeasurementsService {
  constructor(
    @InjectModel(Measurement.name) private measurementModel: Model<MeasurementDocument>,
    @InjectModel(Sensor.name) private sensorModel: Model<SensorDocument>,
    @InjectModel(DailyConsumption.name) private dailyConsumptionModel: Model<DailyConsumptionDocument>,
    @Inject(forwardRef(() => RealtimeGateway)) private realtimeGateway: RealtimeGateway,
  ) { }

  async create(createMeasurementDto: CreateMeasurementDto): Promise<Measurement> {
    const createdMeasurement = new this.measurementModel(createMeasurementDto);
    const measurement = await createdMeasurement.save();

    const flowRate = createMeasurementDto.durationSec > 0
      ? (createMeasurementDto.liters / createMeasurementDto.durationSec) * 60
      : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = new Date(createMeasurementDto.startTime).getTime() >= today.getTime();

    await this.sensorModel.findByIdAndUpdate(createMeasurementDto.sensorId, {
      lastMeasurementAt: createMeasurementDto.endTime,
      currentFlowRate: flowRate,
      lastLiters: createMeasurementDto.liters,
      flowStatus: createMeasurementDto.liters > 0 ? 'flowing' : 'idle',
      ...(isToday && { $inc: { todayTotalLiters: createMeasurementDto.liters } })
    });

    // Agregar a consumo diario en tiempo real
    await this.updateDailyConsumption(createMeasurementDto);

    this.realtimeGateway.emitNewMeasurement(measurement);

    return measurement;
  }

  async findAll(limit?: number): Promise<Measurement[]> {
    const query = this.measurementModel
      .find({})
      .sort({ startTime: -1 });
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
    const query = this.measurementModel
      .find({ homeId })
      .sort({ startTime: -1 });
    if (limit) {
      query.limit(limit);
    }
    return await query.exec();
  }

  async findBySensor(sensorId: string, limit?: number): Promise<Measurement[]> {
    const query = this.measurementModel
      .find({ sensorId })
      .sort({ startTime: -1 });
    if (limit) {
      query.limit(limit);
    }
    return await query.exec();
  }

  async findByDateRange(
    homeId: string,
    startDate: Date,
    endDate: Date,
    sortOrder?: string,
  ): Promise<Measurement[]> {
    const sort = sortOrder || '-startTime';
    return await this.measurementModel
      .find({
        homeId,
        startTime: { $gte: startDate, $lte: endDate },
      })
      .sort(sort)
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

  async getHourlyConsumptionToday(sensorId: string): Promise<any[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();
    const nowWithBuffer = new Date(now.getTime() + 60000); // 1 min buffer

    return await this.measurementModel.aggregate([
      {
        $match: {
          sensorId,
          startTime: { $gte: today, $lte: nowWithBuffer },
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
    const now = new Date();
    const nowWithBuffer = new Date(now.getTime() + 60000); // 1 min buffer

    const result = await this.measurementModel.aggregate([
      {
        $match: {
          sensorId,
          startTime: { $gte: today, $lte: nowWithBuffer },
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

  async getRecentMeasurements(sensorId: string, limit: number = 10): Promise<Measurement[]> {
    return await this.measurementModel
      .find({ sensorId })
      .sort({ startTime: -1 })
      .limit(limit)
      .exec();
  }

  async getLast7DaysConsumption(sensorId: string): Promise<any[]> {
    const now = new Date();
    const nowWithBuffer = new Date(now.getTime() + 60000); // 1 min buffer

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    return await this.measurementModel.aggregate([
      {
        $match: {
          sensorId,
          startTime: { $gte: sevenDaysAgo, $lte: nowWithBuffer },
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

  /**
   * Actualiza o crea el registro de consumo diario cuando llega una medición del sensor
   */
  private async updateDailyConsumption(measurementDto: CreateMeasurementDto): Promise<void> {
    try {
      // Obtener la fecha del día de la medición (medianoche UTC)
      const measurementDate = new Date(measurementDto.startTime);
      const dayStart = new Date(Date.UTC(
        measurementDate.getUTCFullYear(),
        measurementDate.getUTCMonth(),
        measurementDate.getUTCDate(),
        0, 0, 0, 0
      ));

      console.log('📊 Actualizando consumo diario...');
      console.log('HomeId:', measurementDto.homeId);
      console.log('SensorId:', measurementDto.sensorId);
      console.log('Fecha:', dayStart.toISOString());
      console.log('Litros:', measurementDto.liters);

      // Buscar o crear el registro de consumo diario
      const existingRecord = await this.dailyConsumptionModel.findOne({
        homeId: measurementDto.homeId,
        date: dayStart,
      });

      if (existingRecord) {
        // Actualizar registro existente
        const sensorIndex = existingRecord.bySensor.findIndex(
          (s: any) => s.sensorId === measurementDto.sensorId
        );

        if (sensorIndex >= 0) {
          // Actualizar litros del sensor existente
          existingRecord.bySensor[sensorIndex].liters += measurementDto.liters;
        } else {
          // Agregar nuevo sensor al registro
          existingRecord.bySensor.push({
            sensorId: measurementDto.sensorId,
            liters: measurementDto.liters,
          });
        }

        // Actualizar total
        existingRecord.totalLiters += measurementDto.liters;
        await existingRecord.save();

        console.log('✅ Registro actualizado. Total:', existingRecord.totalLiters, 'L');
      } else {
        // Crear nuevo registro
        const newRecord = new this.dailyConsumptionModel({
          homeId: measurementDto.homeId,
          date: dayStart,
          totalLiters: measurementDto.liters,
          bySensor: [
            {
              sensorId: measurementDto.sensorId,
              liters: measurementDto.liters,
            },
          ],
          recommendedLiters: 0,
          limitLiters: 0,
          alerts: [],
        });

        await newRecord.save();
        console.log('✅ Nuevo registro creado. Total:', measurementDto.liters, 'L');
      }
    } catch (error) {
      console.error('❌ Error actualizando consumo diario:', error);
      // No lanzamos el error para no interrumpir el flujo de creación de mediciones
    }
  }

  /**
   * Agrega todas las mediciones existentes a DailyConsumption (uso único para migración)
   */
  async aggregateAllMeasurements(): Promise<{ created: number; updated: number; errors: number }> {
    console.log('🚀 Iniciando agregación retroactiva de mediciones...\n');

    let created = 0;
    let updated = 0;
    let errors = 0;

    try {
      // Obtener todas las mediciones agrupadas por homeId y fecha
      const aggregation = await this.measurementModel.aggregate([
        {
          $project: {
            homeId: 1,
            sensorId: 1,
            liters: 1,
            startTime: 1,
            dayStart: {
              $dateFromParts: {
                year: { $year: '$startTime' },
                month: { $month: '$startTime' },
                day: { $dayOfMonth: '$startTime' },
                hour: 0,
                minute: 0,
                second: 0,
                millisecond: 0,
              },
            },
          },
        },
        {
          $group: {
            _id: {
              homeId: '$homeId',
              date: '$dayStart',
            },
            totalLiters: { $sum: '$liters' },
            sensors: {
              $push: {
                sensorId: '$sensorId',
                liters: '$liters',
              },
            },
          },
        },
        {
          $sort: { '_id.date': 1 },
        },
      ]);

      console.log(`📊 Encontradas ${aggregation.length} combinaciones de hogar/día\n`);

      for (const item of aggregation) {
        const { homeId, date } = item._id;
        const { totalLiters, sensors } = item;

        // Agrupar litros por sensor
        const sensorMap = new Map<string, number>();
        for (const s of sensors) {
          const current = sensorMap.get(s.sensorId) || 0;
          sensorMap.set(s.sensorId, current + s.liters);
        }

        const bySensor = Array.from(sensorMap.entries()).map(([sensorId, liters]) => ({
          sensorId,
          liters,
        }));

        try {
          // Buscar registro existente
          const existing = await this.dailyConsumptionModel.findOne({
            homeId,
            date,
          });

          if (existing) {
            // Actualizar
            existing.totalLiters = totalLiters;
            existing.bySensor = bySensor as any;
            await existing.save();
            updated++;
            console.log(`✅ Actualizado: ${homeId} - ${new Date(date).toISOString().split('T')[0]} - ${totalLiters.toFixed(2)}L`);
          } else {
            // Crear nuevo
            await this.dailyConsumptionModel.create({
              homeId,
              date,
              totalLiters,
              bySensor,
              recommendedLiters: 0,
              limitLiters: 0,
              alerts: [],
            });
            created++;
            console.log(`🆕 Creado: ${homeId} - ${new Date(date).toISOString().split('T')[0]} - ${totalLiters.toFixed(2)}L`);
          }
        } catch (error) {
          errors++;
          console.error(`❌ Error procesando ${homeId} - ${date}:`, error.message);
        }
      }

      console.log('\n📈 Resumen:');
      console.log(`   Creados: ${created}`);
      console.log(`   Actualizados: ${updated}`);
      console.log(`   Errores: ${errors}`);

      return { created, updated, errors };
    } catch (error) {
      console.error('❌ Error en la agregación:', error);
      throw error;
    }
  }
}
