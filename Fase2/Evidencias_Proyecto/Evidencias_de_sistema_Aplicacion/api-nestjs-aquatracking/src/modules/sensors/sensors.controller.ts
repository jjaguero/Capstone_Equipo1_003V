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
import { SensorsService } from './sensors.service';
import { CreateSensorDto, UpdateSensorDto } from './dto';

@Controller('sensors')
export class SensorsController {
  constructor(private readonly sensorsService: SensorsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSensorDto: CreateSensorDto) {
    return this.sensorsService.create(createSensorDto);
  }

  @Get()
  findAll(
    @Query('homeId') homeId?: string,
    @Query('status') status?: string,
    @Query('active') active?: string,
  ) {
    if (homeId) {
      return this.sensorsService.findByHome(homeId);
    }
    if (status) {
      return this.sensorsService.findByStatus(status);
    }
    if (active === 'true') {
      return this.sensorsService.findActive();
    }
    return this.sensorsService.findAll();
  }

  @Get('count')
  count(@Query('homeId') homeId?: string, @Query('status') status?: string) {
    if (homeId) {
      return this.sensorsService.countByHome(homeId);
    }
    if (status) {
      return this.sensorsService.countByStatus(status);
    }
    return this.sensorsService.count();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sensorsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSensorDto: UpdateSensorDto) {
    return this.sensorsService.update(id, updateSensorDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.sensorsService.remove(id);
  }
}
