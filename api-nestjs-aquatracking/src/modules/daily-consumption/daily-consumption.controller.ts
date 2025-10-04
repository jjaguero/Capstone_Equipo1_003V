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
import { DailyConsumptionService } from './daily-consumption.service';
import { CreateDailyConsumptionDto, UpdateDailyConsumptionDto } from './dto';

@Controller('daily-consumption')
export class DailyConsumptionController {
  constructor(private readonly dailyConsumptionService: DailyConsumptionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDailyConsumptionDto: CreateDailyConsumptionDto) {
    return this.dailyConsumptionService.create(createDailyConsumptionDto);
  }

  @Get()
  findAll(@Query('homeId') homeId?: string, @Query('limit') limit?: string) {
    if (homeId) {
      const limitNum = limit ? parseInt(limit, 10) : undefined;
      return this.dailyConsumptionService.findByHome(homeId, limitNum);
    }
    return this.dailyConsumptionService.findAll();
  }

  @Get('weekly/:homeId')
  getWeekly(@Param('homeId') homeId: string) {
    return this.dailyConsumptionService.getWeeklyConsumption(homeId);
  }

  @Get('monthly/:homeId')
  getMonthly(@Param('homeId') homeId: string) {
    return this.dailyConsumptionService.getMonthlyConsumption(homeId);
  }

  @Get('range')
  findByRange(
    @Query('homeId') homeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.dailyConsumptionService.findByDateRange(
      homeId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('stats/total/:homeId')
  getTotalByHome(@Param('homeId') homeId: string) {
    return this.dailyConsumptionService.getTotalByHome(homeId);
  }

  @Get('stats/average/:homeId')
  getAverageByHome(@Param('homeId') homeId: string) {
    return this.dailyConsumptionService.getAverageByHome(homeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dailyConsumptionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDailyConsumptionDto: UpdateDailyConsumptionDto,
  ) {
    return this.dailyConsumptionService.update(id, updateDailyConsumptionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.dailyConsumptionService.remove(id);
  }
}
