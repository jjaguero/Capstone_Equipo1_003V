import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateSectorDto {
  @IsString()
  name: string;

  @IsString()
  aprName: string;

  @IsString()
  region: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
