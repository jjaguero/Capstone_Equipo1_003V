import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
import { CreateMeasurementDto, UpdateMeasurementDto } from './dto';

@Controller('measurements')
export class MeasurementsController {
  constructor(private readonly measurementsService: MeasurementsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createMeasurementDto: CreateMeasurementDto) {
    return this.measurementsService.create(createMeasurementDto);
  }

  @Get()
  findAll(
    @Query('homeId') homeId?: string,
    @Query('sensorId') sensorId?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sort') sort?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    
    // Si hay fechas, usar filtro por rango
    if (homeId && startDate && endDate) {
      return this.measurementsService.findByDateRange(
        homeId,
        new Date(startDate),
        new Date(endDate),
        sort,
      );
    }
    
    if (homeId) {
      return this.measurementsService.findByHome(homeId, limitNum);
    }
    if (sensorId) {
      return this.measurementsService.findBySensor(sensorId, limitNum);
    }
    return this.measurementsService.findAll(limitNum);
  }

  @Get('range')
  findByRange(
    @Query('homeId') homeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.measurementsService.findByDateRange(
      homeId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('sum/:homeId')
  sumByHome(@Param('homeId') homeId: string) {
    return this.measurementsService.sumLitersByHome(homeId);
  }

  @Get('sensor/:sensorId/hourly')
  getHourlyConsumption(@Param('sensorId') sensorId: string) {
    return this.measurementsService.getHourlyConsumptionToday(sensorId);
  }

  @Get('sensor/:sensorId/today')
  getTodayConsumption(@Param('sensorId') sensorId: string) {
    return this.measurementsService.getTodayConsumption(sensorId);
  }

  @Get('sensor/:sensorId/recent')
  getRecentMeasurements(
    @Param('sensorId') sensorId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.measurementsService.getRecentMeasurements(sensorId, limitNum);
  }

  @Get('sensor/:sensorId/last-7-days')
  getLast7Days(@Param('sensorId') sensorId: string) {
    return this.measurementsService.getLast7DaysConsumption(sensorId);
  }

  @Get('count')
  count() {
    return this.measurementsService.count();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.measurementsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMeasurementDto: UpdateMeasurementDto) {
    return this.measurementsService.update(id, updateMeasurementDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.measurementsService.remove(id);
  }
}
