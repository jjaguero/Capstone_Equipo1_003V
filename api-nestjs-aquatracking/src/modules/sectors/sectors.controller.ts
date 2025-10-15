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
import { SectorsService } from './sectors.service';
import { CreateSectorDto, UpdateSectorDto } from './dto';

@Controller('sectors')
export class SectorsController {
  constructor(private readonly sectorsService: SectorsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSectorDto: CreateSectorDto) {
    return this.sectorsService.create(createSectorDto);
  }

  @Get()
  findAll(@Query('aprName') aprName?: string, @Query('active') active?: string) {
    if (aprName) {
      return this.sectorsService.findByApr(aprName);
    }
    if (active === 'true') {
      return this.sectorsService.findActive();
    }
    return this.sectorsService.findAll();
  }

  @Get('count')
  count() {
    return this.sectorsService.count();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sectorsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSectorDto: UpdateSectorDto) {
    return this.sectorsService.update(id, updateSectorDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.sectorsService.remove(id);
  }
}
