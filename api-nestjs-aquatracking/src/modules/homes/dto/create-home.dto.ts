import { IsString, IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateHomeDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  sectorId: string;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  members?: number;
}
