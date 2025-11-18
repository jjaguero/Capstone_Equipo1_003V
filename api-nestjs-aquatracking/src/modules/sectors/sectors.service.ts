import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sector, SectorDocument } from '../../schemas/sector.schema';
import { CreateSectorDto, UpdateSectorDto } from './dto';

@Injectable()
export class SectorsService {
  constructor(
    @InjectModel(Sector.name) private sectorModel: Model<SectorDocument>,
  ) {}

  async create(createSectorDto: CreateSectorDto): Promise<Sector> {
    try {
      const createdSector = new this.sectorModel(createSectorDto);
      return await createdSector.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('El sector ya existe');
      }
      throw error;
    }
  }

  async findAll(): Promise<Sector[]> {
    return await this.sectorModel.find().exec();
  }

  async findActive(): Promise<Sector[]> {
    return await this.sectorModel.find({ active: true }).exec();
  }

  async findOne(id: string): Promise<Sector> {
    const sector = await this.sectorModel.findById(id).exec();
    if (!sector) {
      throw new NotFoundException(`Sector con ID ${id} no encontrado`);
    }
    return sector;
  }

  async findByApr(aprName: string): Promise<Sector[]> {
    return await this.sectorModel.find({ aprName }).exec();
  }

  async update(id: string, updateSectorDto: UpdateSectorDto): Promise<Sector> {
    const updatedSector = await this.sectorModel
      .findByIdAndUpdate(id, updateSectorDto, { new: true })
      .exec();
    
    if (!updatedSector) {
      throw new NotFoundException(`Sector con ID ${id} no encontrado`);
    }
    return updatedSector;
  }

  async remove(id: string): Promise<void> {
    const result = await this.sectorModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Sector con ID ${id} no encontrado`);
    }
  }

  async count(): Promise<number> {
    return await this.sectorModel.countDocuments().exec();
  }
}
