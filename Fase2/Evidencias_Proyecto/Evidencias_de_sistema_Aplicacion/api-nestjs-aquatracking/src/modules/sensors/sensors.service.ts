import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sensor, SensorDocument } from '../../schemas/sensor.schema';
import { CreateSensorDto, UpdateSensorDto } from './dto';

@Injectable()
export class SensorsService {
  constructor(
    @InjectModel(Sensor.name) private sensorModel: Model<SensorDocument>,
  ) {}

  async create(createSensorDto: CreateSensorDto): Promise<Sensor> {
    try {
      const createdSensor = new this.sensorModel(createSensorDto);
      return await createdSensor.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('El número de serie ya existe');
      }
      throw error;
    }
  }

  async findAll(): Promise<Sensor[]> {
    return await this.sensorModel.find().exec();
  }

  async findActive(): Promise<Sensor[]> {
    return await this.sensorModel.find({ status: 'active' }).exec();
  }

  async findOne(id: string): Promise<Sensor> {
    const sensor = await this.sensorModel.findById(id).exec();
    if (!sensor) {
      throw new NotFoundException(`Sensor con ID ${id} no encontrado`);
    }
    return sensor;
  }

  async findByHome(homeId: string): Promise<Sensor[]> {
    return await this.sensorModel.find({ homeId }).exec();
  }

  async findBySerialNumber(serialNumber: string): Promise<Sensor | null> {
    return await this.sensorModel.findOne({ serialNumber }).exec();
  }

  async findByStatus(status: string): Promise<Sensor[]> {
    return await this.sensorModel.find({ status }).exec();
  }

  async update(id: string, updateSensorDto: UpdateSensorDto): Promise<Sensor> {
    const updatedSensor = await this.sensorModel
      .findByIdAndUpdate(id, updateSensorDto, { new: true })
      .exec();
    
    if (!updatedSensor) {
      throw new NotFoundException(`Sensor con ID ${id} no encontrado`);
    }
    return updatedSensor;
  }

  async remove(id: string): Promise<void> {
    const result = await this.sensorModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Sensor con ID ${id} no encontrado`);
    }
  }

  async count(): Promise<number> {
    return await this.sensorModel.countDocuments().exec();
  }

  async countByHome(homeId: string): Promise<number> {
    return await this.sensorModel.countDocuments({ homeId }).exec();
  }

  async countByStatus(status: string): Promise<number> {
    return await this.sensorModel.countDocuments({ status }).exec();
  }
}
