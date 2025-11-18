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
import { AlertsService } from './alerts.service';
import { CreateAlertDto, UpdateAlertDto } from './dto';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAlertDto: CreateAlertDto) {
    return this.alertsService.create(createAlertDto);
  }

  @Get()
  findAll(
    @Query('homeId') homeId?: string,
    @Query('type') type?: string,
    @Query('unresolved') unresolved?: string,
  ) {
    if (homeId && unresolved === 'true') {
      return this.alertsService.findUnresolvedByHome(homeId);
    }
    if (homeId) {
      return this.alertsService.findByHome(homeId);
    }
    if (unresolved === 'true') {
      return this.alertsService.findUnresolved();
    }
    if (type) {
      return this.alertsService.findByType(type);
    }
    return this.alertsService.findAll();
  }

  @Get('count')
  count(@Query('homeId') homeId?: string, @Query('unresolved') unresolved?: string) {
    if (unresolved === 'true') {
      return this.alertsService.countUnresolved();
    }
    if (homeId) {
      return this.alertsService.countByHome(homeId);
    }
    return this.alertsService.count();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alertsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAlertDto: UpdateAlertDto) {
    return this.alertsService.update(id, updateAlertDto);
  }

  @Patch(':id/resolve')
  resolve(@Param('id') id: string) {
    return this.alertsService.markAsResolved(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.alertsService.remove(id);
  }
}
