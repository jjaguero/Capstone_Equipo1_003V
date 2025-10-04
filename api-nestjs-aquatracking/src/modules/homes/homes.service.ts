import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Home, HomeDocument } from '../../schemas/home.schema';
import { CreateHomeDto, UpdateHomeDto } from './dto';

@Injectable()
export class HomesService {
  constructor(
    @InjectModel(Home.name) private homeModel: Model<HomeDocument>,
  ) {}

  async create(createHomeDto: CreateHomeDto): Promise<Home> {
    const createdHome = new this.homeModel(createHomeDto);
    return await createdHome.save();
  }

  async findAll(): Promise<Home[]> {
    return await this.homeModel.find().exec();
  }

  async findActive(): Promise<Home[]> {
    return await this.homeModel.find({ active: true }).exec();
  }

  async findOne(id: string): Promise<Home> {
    const home = await this.homeModel.findById(id).exec();
    if (!home) {
      throw new NotFoundException(`Casa con ID ${id} no encontrada`);
    }
    return home;
  }

  async findBySector(sectorId: string): Promise<Home[]> {
    return await this.homeModel.find({ sectorId }).exec();
  }

  async update(id: string, updateHomeDto: UpdateHomeDto): Promise<Home> {
    const updatedHome = await this.homeModel
      .findByIdAndUpdate(id, updateHomeDto, { new: true })
      .exec();
    
    if (!updatedHome) {
      throw new NotFoundException(`Casa con ID ${id} no encontrada`);
    }
    return updatedHome;
  }

  async remove(id: string): Promise<void> {
    const result = await this.homeModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Casa con ID ${id} no encontrada`);
    }
  }

  async count(): Promise<number> {
    return await this.homeModel.countDocuments().exec();
  }

  async countBySector(sectorId: string): Promise<number> {
    return await this.homeModel.countDocuments({ sectorId }).exec();
  }
}
