import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray } from 'class-validator';

export class CreateSupportTicketDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  homeId: string;

  @IsString()
  @IsOptional()
  sensorId?: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(['sensor_issue', 'sensor_maintenance_request', 'high_consumption', 'leak_detection', 'general_inquiry', 'other'])
  @IsNotEmpty()
  category: string;

  @IsEnum(['low', 'medium', 'high', 'urgent'])
  @IsOptional()
  priority?: string;

  @IsArray()
  @IsOptional()
  attachments?: string[];
}
