import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as ort from 'onnxruntime-node';
import * as path from 'path';
import { Home, HomeDocument } from '../../schemas/home.schema';
import { Sector, SectorDocument } from '../../schemas/sector.schema';

export interface PredictionResult {
  homeId: string;
  predictedLiters: number;
  date: Date;
  confidence: string;
  features: {
    members: number;
    month: number;
    dayOfWeek: number;
    sector: string;
  };
}

@Injectable()
export class PredictionService implements OnModuleInit {
  private readonly logger = new Logger(PredictionService.name);
  private session: ort.InferenceSession | null = null;
  private sectorNames: string[] = [];

  constructor(
    @InjectModel(Home.name) private homeModel: Model<HomeDocument>,
    @InjectModel(Sector.name) private sectorModel: Model<SectorDocument>,
  ) {}

  async onModuleInit() {
    try {
      const modelPath = path.join(process.cwd(), 'models', 'modelo_consumo.onnx');
      this.logger.log(`Loading ONNX model from: ${modelPath}`);
      this.session = await ort.InferenceSession.create(modelPath);
      this.logger.log('ONNX model loaded successfully');
      const sectors = await this.sectorModel.find().exec();
      this.sectorNames = sectors.map(s => s.name).sort();
      this.logger.log(`Loaded ${this.sectorNames.length} sectors for encoding`);
    } catch (error) {
      this.logger.error('Failed to load ONNX model', error);
      throw error;
    }
  }

  async predictForHome(homeId: string, targetDate?: Date): Promise<PredictionResult> {
    try {
      // Verificar que el modelo esté cargado
      if (!this.session) {
        throw new Error('ONNX model not loaded. Please check server logs.');
      }

      const home = await this.homeModel.findById(homeId).populate('sectorId').exec();
      if (!home) {
        throw new Error(`Home with id ${homeId} not found`);
      }

      const date = targetDate || new Date();
      const month = date.getMonth() + 1; // 1-12
      const dayOfWeek = date.getDay(); // 0-6
      const members = home.members || 1;
      const sectorName = (home.sectorId as any)?.name || 'Unknown';
      const sectorFeatures = this.encodeSector(sectorName);
      const features = [members, month, dayOfWeek, ...sectorFeatures];
      const inputTensor = new ort.Tensor('float32', new Float32Array(features), [1, features.length]);
      const feeds = { float_input: inputTensor };
      const results = await this.session.run(feeds);
      const outputData = results[Object.keys(results)[0]].data as Float32Array;
      const predictedLiters = Math.max(0, outputData[0]); // No permitir valores negativos

      return {
        homeId,
        predictedLiters: Math.round(predictedLiters * 100) / 100,
        date,
        confidence: this.calculateConfidence(predictedLiters),
        features: {
          members,
          month,
          dayOfWeek,
          sector: sectorName,
        },
      };
    } catch (error) {
      this.logger.error(`Error predicting for home ${homeId}:`, error);
      throw error;
    }
  }

  async predictForMultipleHomes(homeIds: string[], targetDate?: Date): Promise<PredictionResult[]> {
    const predictions = await Promise.all(
      homeIds.map(homeId => this.predictForHome(homeId, targetDate)),
    );
    return predictions;
  }

  async predictForUser(userId: string, targetDate?: Date): Promise<PredictionResult[]> {
    const homes = await this.homeModel.find({ userId }).exec();
    const homeIds = homes.map(h => (h._id as any).toString());
    return this.predictForMultipleHomes(homeIds, targetDate);
  }

 
  async predictNextDays(homeId: string, days: number = 7): Promise<PredictionResult[]> {
    const predictions: PredictionResult[] = [];
    const today = new Date();

    for (let i = 1; i <= days; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      const prediction = await this.predictForHome(homeId, targetDate);
      predictions.push(prediction);
    }

    return predictions;
  }

  private encodeSector(sectorName: string): number[] {

    const encoding = new Array(this.sectorNames.length - 1).fill(0);
    
    const sectorIndex = this.sectorNames.indexOf(sectorName);
    if (sectorIndex > 0) {
      encoding[sectorIndex - 1] = 1;
    }
    
    return encoding;
  }


  private calculateConfidence(predictedLiters: number): string {
    if (predictedLiters < 50) return 'low';
    if (predictedLiters > 1000) return 'low';
    return 'high';
  }
}
