import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';

export class CreateSensorDto {
  @IsString()
  homeId: string;

  @IsString()
  serialNumber: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  subType?: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'maintenance', 'absent'])
  status?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
