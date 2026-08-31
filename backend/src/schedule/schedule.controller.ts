import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { CreateBlockDto, UpdateBlockDto } from './dto/schedule-block.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, SlotType } from '@prisma/client';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Agenda y Bloques Horarios (HU-01)')
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('blocks')
  @ApiOperation({ summary: 'Listar bloques horarios disponibles' })
  @ApiQuery({ name: 'dayOfWeek', required: false, example: 'Monday' })
  @ApiQuery({ name: 'type', required: false, enum: SlotType })
  @ApiQuery({ name: 'onlyActive', required: false, type: Boolean })
  findAll(
    @Query('dayOfWeek') dayOfWeek?: string,
    @Query('type') type?: SlotType,
    @Query('onlyActive') onlyActive?: string,
  ) {
    return this.scheduleService.findAll(dayOfWeek, type, onlyActive !== 'false');
  }

  @Get('grid')
  @ApiOperation({ summary: 'Obtener parrilla diaria con alumnos y restricciones médicas' })
  @ApiQuery({ name: 'date', required: true, example: '2026-08-31' })
  getDailyGrid(@Query('date') date: string) {
    return this.scheduleService.getDailyGrid(date);
  }

  @Get('blocks/:id')
  @ApiOperation({ summary: 'Obtener detalle de un bloque horario' })
  findOne(@Param('id') id: string) {
    return this.scheduleService.findOne(id);
  }

  @Post('blocks')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.KINESIOLOGO)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nuevo bloque horario (Solo Staff / Admin)' })
  create(@Body() dto: CreateBlockDto, @GetUser('name') authorName: string) {
    return this.scheduleService.create(dto, authorName);
  }

  @Patch('blocks/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.KINESIOLOGO)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar capacidad o estado de un bloque horario' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBlockDto,
    @GetUser('name') authorName: string,
  ) {
    return this.scheduleService.update(id, dto, authorName);
  }

  @Delete('blocks/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un bloque horario (Solo Admin)' })
  remove(@Param('id') id: string, @GetUser('name') authorName: string) {
    return this.scheduleService.remove(id, authorName);
  }
}
