import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PredictionController } from './prediction.controller';
import { PredictionService } from './prediction.service';
import { Home, HomeSchema } from '../../schemas/home.schema';
import { Sector, SectorSchema } from '../../schemas/sector.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Home.name, schema: HomeSchema },
      { name: Sector.name, schema: SectorSchema },
    ]),
  ],
  controllers: [PredictionController],
  providers: [PredictionService],
  exports: [PredictionService],
})
export class PredictionModule {}
