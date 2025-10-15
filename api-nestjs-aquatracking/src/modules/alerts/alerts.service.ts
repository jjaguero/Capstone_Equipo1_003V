import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Alert, AlertDocument } from '../../schemas/alert.schema';
import { CreateAlertDto, UpdateAlertDto } from './dto';

@Injectable()
export class AlertsService {
  constructor(
    @InjectModel(Alert.name) private alertModel: Model<AlertDocument>,
  ) {}

  async create(createAlertDto: CreateAlertDto): Promise<Alert> {
    const createdAlert = new this.alertModel(createAlertDto);
    return await createdAlert.save();
  }

  async findAll(): Promise<Alert[]> {
    return await this.alertModel.find().sort({ triggeredAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Alert> {
    const alert = await this.alertModel.findById(id).exec();
    if (!alert) {
      throw new NotFoundException(`Alerta con ID ${id} no encontrada`);
    }
    return alert;
  }

  async findByHome(homeId: string): Promise<Alert[]> {
    return await this.alertModel
      .find({ homeId })
      .sort({ triggeredAt: -1 })
      .exec();
  }

  async findUnresolved(): Promise<Alert[]> {
    return await this.alertModel
      .find({ resolved: false })
      .sort({ triggeredAt: -1 })
      .exec();
  }

  async findUnresolvedByHome(homeId: string): Promise<Alert[]> {
    return await this.alertModel
      .find({ homeId, resolved: false })
      .sort({ triggeredAt: -1 })
      .exec();
  }

  async findByType(type: string): Promise<Alert[]> {
    return await this.alertModel
      .find({ type })
      .sort({ triggeredAt: -1 })
      .exec();
  }

  async update(id: string, updateAlertDto: UpdateAlertDto): Promise<Alert> {
    const updatedAlert = await this.alertModel
      .findByIdAndUpdate(id, updateAlertDto, { new: true })
      .exec();
    
    if (!updatedAlert) {
      throw new NotFoundException(`Alerta con ID ${id} no encontrada`);
    }
    return updatedAlert;
  }

  async markAsResolved(id: string): Promise<Alert> {
    return await this.update(id, { resolved: true } as UpdateAlertDto);
  }

  async remove(id: string): Promise<void> {
    const result = await this.alertModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Alerta con ID ${id} no encontrada`);
    }
  }

  async count(): Promise<number> {
    return await this.alertModel.countDocuments().exec();
  }

  async countUnresolved(): Promise<number> {
    return await this.alertModel.countDocuments({ resolved: false }).exec();
  }

  async countByHome(homeId: string): Promise<number> {
    return await this.alertModel.countDocuments({ homeId }).exec();
  }
}
