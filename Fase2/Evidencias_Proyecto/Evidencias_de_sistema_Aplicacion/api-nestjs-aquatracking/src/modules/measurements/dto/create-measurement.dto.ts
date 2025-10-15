import { IsString, IsNumber, IsDate, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMeasurementDto {
  @IsString()
  sensorId: string;

  @IsString()
  homeId: string;

  @Type(() => Date)
  @IsDate()
  startTime: Date;

  @Type(() => Date)
  @IsDate()
  endTime: Date;

  @IsNumber()
  @Min(0)
  liters: number;

  @IsNumber()
  @Min(0)
  durationSec: number;

  @IsOptional()
  @IsString()
  unit?: string;
}
