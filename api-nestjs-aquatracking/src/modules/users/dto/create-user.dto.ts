import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  rut: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(['user', 'admin'])
  role: string;

  @IsOptional()
  @IsString()
  homeId?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsNumber()
  limitLitersPerDay?: number;
}
