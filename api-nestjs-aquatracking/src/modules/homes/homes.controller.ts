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
import { HomesService } from './homes.service';
import { CreateHomeDto, UpdateHomeDto } from './dto';

@Controller('homes')
export class HomesController {
  constructor(private readonly homesService: HomesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createHomeDto: CreateHomeDto) {
    return this.homesService.create(createHomeDto);
  }

  @Get()
  findAll(@Query('sectorId') sectorId?: string, @Query('active') active?: string) {
    if (sectorId) {
      return this.homesService.findBySector(sectorId);
    }
    if (active === 'true') {
      return this.homesService.findActive();
    }
    return this.homesService.findAll();
  }

  @Get('count')
  count(@Query('sectorId') sectorId?: string) {
    if (sectorId) {
      return this.homesService.countBySector(sectorId);
    }
    return this.homesService.count();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.homesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHomeDto: UpdateHomeDto) {
    return this.homesService.update(id, updateHomeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.homesService.remove(id);
  }
}
