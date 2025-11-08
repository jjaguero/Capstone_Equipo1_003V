import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';
import { AddCommentDto } from './dto/add-comment.dto';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  /**
   * Crear un nuevo ticket de soporte
   * POST /support
   */
  @Post()
  create(@Body() createDto: CreateSupportTicketDto) {
    return this.supportService.create(createDto);
  }

  /**
   * Obtener todos los tickets (admin)
   * GET /support
   */
  @Get()
  findAll(@Query('status') status?: string, @Query('userId') userId?: string) {
    if (status) {
      return this.supportService.findByStatus(status);
    }
    if (userId) {
      return this.supportService.findByUser(userId);
    }
    return this.supportService.findAll();
  }

  /**
   * Obtener estadísticas de tickets
   * GET /support/stats
   */
  @Get('stats')
  getStats() {
    return this.supportService.getStats();
  }

  /**
   * Obtener tickets por usuario
   * GET /support/user/:userId
   */
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.supportService.findByUser(userId);
  }

  /**
   * Obtener tickets por hogar
   * GET /support/home/:homeId
   */
  @Get('home/:homeId')
  findByHome(@Param('homeId') homeId: string) {
    return this.supportService.findByHome(homeId);
  }

  /**
   * Obtener tickets por sensor
   * GET /support/sensor/:sensorId
   */
  @Get('sensor/:sensorId')
  findBySensor(@Param('sensorId') sensorId: string) {
    return this.supportService.findBySensor(sensorId);
  }

  /**
   * Obtener un ticket por ID
   * GET /support/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.supportService.findOne(id);
  }

  /**
   * Actualizar un ticket
   * PATCH /support/:id
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateSupportTicketDto) {
    return this.supportService.update(id, updateDto);
  }

  /**
   * Agregar comentario a un ticket
   * POST /support/:id/comments
   */
  @Post(':id/comments')
  addComment(@Param('id') id: string, @Body() commentDto: AddCommentDto) {
    return this.supportService.addComment(id, commentDto);
  }

  /**
   * Asignar ticket a un admin
   * PATCH /support/:id/assign/:adminId
   */
  @Patch(':id/assign/:adminId')
  assignTicket(@Param('id') id: string, @Param('adminId') adminId: string) {
    return this.supportService.assignTicket(id, adminId);
  }

  /**
   * Eliminar un ticket
   * DELETE /support/:id
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.supportService.remove(id);
  }
}
