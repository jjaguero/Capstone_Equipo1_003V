import { PartialType } from '@nestjs/mapped-types';
import { CreateDailyConsumptionDto } from './create-daily-consumption.dto';

export class UpdateDailyConsumptionDto extends PartialType(CreateDailyConsumptionDto) {}
