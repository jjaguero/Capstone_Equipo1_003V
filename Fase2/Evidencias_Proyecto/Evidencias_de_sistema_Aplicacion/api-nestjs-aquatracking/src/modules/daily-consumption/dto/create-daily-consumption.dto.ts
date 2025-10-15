import { IsString, IsNumber, IsDate, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class BySensorDto {
  @IsString()
  sensorId: string;

  @IsNumber()
  @Min(0)
  liters: number;
}

class DailyAlertDto {
  @IsString()
  type: string;

  @IsString()
  message: string;

  @Type(() => Date)
  @IsDate()
  triggeredAt: Date;
}

export class CreateDailyConsumptionDto {
  @IsString()
  homeId: string;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsNumber()
  @Min(0)
  totalLiters: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BySensorDto)
  bySensor?: BySensorDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  recommendedLiters?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  limitLiters?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DailyAlertDto)
  alerts?: DailyAlertDto[];
}
