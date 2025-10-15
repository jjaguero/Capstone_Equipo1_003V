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
  ) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    
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
