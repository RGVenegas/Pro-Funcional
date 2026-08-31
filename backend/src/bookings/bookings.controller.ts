import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, RescheduleBookingDto } from './dto/booking.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { BookingStatus, Role } from '@prisma/client';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Agendamiento y Reservas (HU-03 / HU-04)')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva reserva de cupo (HU-03)' })
  create(@GetUser('id') userId: string, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(userId, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Obtener historial y próximas citas del usuario autenticado' })
  findMy(@GetUser('id') userId: string) {
    return this.bookingsService.findMyBookings(userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.KINESIOLOGO, Role.COACH)
  @ApiOperation({ summary: 'Listar todas las reservas del sistema (Staff)' })
  @ApiQuery({ name: 'status', required: false, enum: BookingStatus })
  @ApiQuery({ name: 'date', required: false, example: '2026-08-31' })
  findAll(@Query('status') status?: BookingStatus, @Query('date') date?: string) {
    return this.bookingsService.findAll(status, date);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar una reserva con verificación de plazo de 24h (HU-04)' })
  cancel(@Param('id') id: string, @GetUser() user: any) {
    return this.bookingsService.cancel(id, user);
  }

  @Patch(':id/reschedule')
  @ApiOperation({ summary: 'Reagendar una cita a otro bloque sin costo adicional (HU-04)' })
  reschedule(
    @Param('id') id: string,
    @GetUser() user: any,
    @Body() dto: RescheduleBookingDto,
  ) {
    return this.bookingsService.reschedule(id, user, dto);
  }

  @Patch(':id/attendance')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.KINESIOLOGO, Role.COACH)
  @ApiOperation({ summary: 'Marcar asistencia (Asistió / No-Show) (HU-02)' })
  updateAttendance(
    @Param('id') id: string,
    @Body('status') status: BookingStatus,
    @GetUser('name') staffName: string,
  ) {
    return this.bookingsService.updateAttendance(id, status, staffName);
  }
}
