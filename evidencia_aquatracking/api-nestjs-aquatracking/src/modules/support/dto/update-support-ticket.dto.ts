import { PartialType } from '@nestjs/mapped-types';
import { CreateSupportTicketDto } from './create-support-ticket.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateSupportTicketDto extends PartialType(CreateSupportTicketDto) {
  @IsEnum(['open', 'in_progress', 'resolved', 'closed'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  assignedTo?: string;
}
