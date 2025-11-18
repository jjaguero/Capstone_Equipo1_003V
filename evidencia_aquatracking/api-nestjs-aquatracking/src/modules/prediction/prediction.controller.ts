import { Controller, Get, Param, Query } from '@nestjs/common';
import { PredictionService } from './prediction.service';

@Controller('predictions')
export class PredictionController {
  constructor(private readonly predictionService: PredictionService) {}

  /**
   * GET /predictions/home/:homeId
   * Obtiene predicción para un hogar específico
   */
  @Get('home/:homeId')
  async predictForHome(
    @Param('homeId') homeId: string,
    @Query('date') dateStr?: string,
  ) {
    const targetDate = dateStr ? new Date(dateStr) : undefined;
    return this.predictionService.predictForHome(homeId, targetDate);
  }

  @Get('home/:homeId/next-days')
  async predictNextDays(
    @Param('homeId') homeId: string,
    @Query('days') days?: string,
  ) {
    const numDays = days ? parseInt(days, 10) : 7;
    return this.predictionService.predictNextDays(homeId, numDays);
  }

  @Get('user/:userId')
  async predictForUser(
    @Param('userId') userId: string,
    @Query('date') dateStr?: string,
  ) {
    const targetDate = dateStr ? new Date(dateStr) : undefined;
    return this.predictionService.predictForUser(userId, targetDate);
  }
}
