import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SupportTicket, SupportTicketDocument } from '../../schemas/support-ticket.schema';
import { Sensor, SensorDocument } from '../../schemas/sensor.schema';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';
import { AddCommentDto } from './dto/add-comment.dto';

@Injectable()
export class SupportService {
  constructor(
    @InjectModel(SupportTicket.name)
    private supportTicketModel: Model<SupportTicketDocument>,
    @InjectModel(Sensor.name)
    private sensorModel: Model<SensorDocument>,
  ) {}

  /**
   * Crear un nuevo ticket de soporte
   * Si es un problema de sensor, cambia su estado a "maintenance"
   */
  async create(createDto: CreateSupportTicketDto): Promise<SupportTicket> {
    const ticket = new this.supportTicketModel({
      ...createDto,
      status: 'open',
      priority: createDto.priority || 'medium',
      comments: [],
    });
    
    const savedTicket = await ticket.save();

    // Si el ticket es sobre un sensor, cambiar su estado a "maintenance"
    if (createDto.category === 'sensor_issue' && createDto.sensorId) {
      await this.sensorModel.findByIdAndUpdate(
        createDto.sensorId,
        { status: 'maintenance' },
        { new: true }
      ).exec();
    }

    return savedTicket;
  }

  /**
   * Obtener todos los tickets (para admin)
   */
  async findAll(): Promise<SupportTicket[]> {
    return this.supportTicketModel
      .find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email rut')
      .exec();
  }

  /**
   * Obtener tickets por usuario
   */
  async findByUser(userId: string): Promise<SupportTicket[]> {
    return this.supportTicketModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email rut')
      .exec();
  }

  /**
   * Obtener tickets por hogar
   */
  async findByHome(homeId: string): Promise<SupportTicket[]> {
    return this.supportTicketModel
      .find({ homeId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email rut')
      .exec();
  }

  /**
   * Obtener tickets por sensor
   */
  async findBySensor(sensorId: string): Promise<SupportTicket[]> {
    return this.supportTicketModel
      .find({ sensorId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email rut')
      .exec();
  }

  /**
   * Obtener tickets por estado
   */
  async findByStatus(status: string): Promise<SupportTicket[]> {
    return this.supportTicketModel
      .find({ status })
      .sort({ priority: -1, createdAt: -1 })
      .exec();
  }

  /**
   * Obtener un ticket por ID
   */
  async findOne(id: string): Promise<SupportTicket | null> {
    return this.supportTicketModel.findById(id).exec();
  }

  /**
   * Actualizar un ticket
   * Si se resuelve un ticket de sensor, vuelve el sensor a "active"
   */
  async update(id: string, updateDto: UpdateSupportTicketDto): Promise<SupportTicket | null> {
    const updateData: any = { ...updateDto };

    // Si se está resolviendo el ticket, agregar timestamp
    if (updateDto.status === 'resolved' && !updateData.resolvedAt) {
      updateData.resolvedAt = new Date();
    }

    // Si se está cerrando el ticket, agregar timestamp
    if (updateDto.status === 'closed' && !updateData.closedAt) {
      updateData.closedAt = new Date();
    }

    const ticket = await this.supportTicketModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('userId', 'name email rut')
      .exec();

    // Si se resolvió un ticket de sensor, cambiar el sensor de vuelta a "active"
    if (ticket && (updateDto.status === 'resolved' || updateDto.status === 'closed')) {
      if (ticket.category === 'sensor_issue' && ticket.sensorId) {
        await this.sensorModel.findByIdAndUpdate(
          ticket.sensorId,
          { status: 'active' },
          { new: true }
        ).exec();
      }
    }

    return ticket;
  }

  /**
   * Agregar un comentario al ticket
   */
  async addComment(id: string, commentDto: AddCommentDto): Promise<SupportTicket | null> {
    const comment = {
      ...commentDto,
      timestamp: new Date(),
    };

    return this.supportTicketModel
      .findByIdAndUpdate(
        id,
        { $push: { comments: comment } },
        { new: true }
      )
      .populate('userId', 'name email rut')
      .exec();
  }

  /**
   * Asignar ticket a un admin
   */
  async assignTicket(id: string, adminId: string): Promise<SupportTicket | null> {
    return this.supportTicketModel
      .findByIdAndUpdate(
        id,
        { 
          assignedTo: adminId,
          status: 'in_progress'
        },
        { new: true }
      )
      .exec();
  }

  /**
   * Eliminar un ticket
   */
  async remove(id: string): Promise<SupportTicket | null> {
    return this.supportTicketModel.findByIdAndDelete(id).exec();
  }

  /**
   * Obtener estadísticas de tickets
   */
  async getStats(): Promise<any> {
    const [total, open, inProgress, resolved, closed] = await Promise.all([
      this.supportTicketModel.countDocuments(),
      this.supportTicketModel.countDocuments({ status: 'open' }),
      this.supportTicketModel.countDocuments({ status: 'in_progress' }),
      this.supportTicketModel.countDocuments({ status: 'resolved' }),
      this.supportTicketModel.countDocuments({ status: 'closed' }),
    ]);

    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      active: open + inProgress,
    };
  }
}
