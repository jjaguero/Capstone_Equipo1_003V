import { IsString, IsBoolean, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAlertDto {
  @IsString()
  homeId: string;

  @IsString()
  type: string;

  @IsString()
  message: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  triggeredAt?: Date;

  @IsOptional()
  @IsBoolean()
  resolved?: boolean;
}
