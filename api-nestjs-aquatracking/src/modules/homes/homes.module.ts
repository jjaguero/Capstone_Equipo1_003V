import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HomesService } from './homes.service';
import { HomesController } from './homes.controller';
import { Home, HomeSchema } from '../../schemas/home.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Home.name, schema: HomeSchema }]),
  ],
  controllers: [HomesController],
  providers: [HomesService],
  exports: [HomesService],
})
export class HomesModule {}
