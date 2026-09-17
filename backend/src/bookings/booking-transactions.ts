import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, Prisma, Role, SlotType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto, RescheduleBookingDto } from './dto/booking.dto';
import { serial } from '../common/transaction';
import { appointmentTime, today, dayNames, BOOKING_NOTICE_HOURS } from '../common/dates';

const DEFAULT_SCHEDULE_BLOCKS: Record<string, { dayOfWeek: string; startTime: string; endTime: string; title: string; instructor: string; type: SlotType; capacity: number }> = {
  'block-1': { dayOfWeek: 'Monday', startTime: '08:00', endTime: '09:00', title: 'Box Clínico Kinesiología 1', instructor: 'Klgo. Andrés Morales', type: SlotType.KINE_BOX, capacity: 1 },
  'block-2': { dayOfWeek: 'Monday', startTime: '18:00', endTime: '19:00', title: 'Entrenamiento Funcional HIIT', instructor: 'Prof. Mike R.', type: SlotType.FUNCTIONAL, capacity: 12 },
  'block-3': { dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '10:00', title: 'Kinesiología & Terapia Manual', instructor: 'Klga. Valeria Reyes', type: SlotType.KINE_BOX, capacity: 1 },
  'block-4': { dayOfWeek: 'Tuesday', startTime: '18:00', endTime: '19:00', title: 'Entrenamiento Funcional y Core', instructor: 'Prof. Mike R.', type: SlotType.FUNCTIONAL, capacity: 12 },
  'block-5': { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '10:00', title: 'Entrenamiento Funcional HIIT', instructor: 'Prof. Mike R.', type: SlotType.FUNCTIONAL, capacity: 12 },
  'block-6': { dayOfWeek: 'Wednesday', startTime: '18:00', endTime: '19:00', title: 'Funcional & Control Motor', instructor: 'Prof. Carlos Vega', type: SlotType.FUNCTIONAL, capacity: 10 },
  'block-7': { dayOfWeek: 'Thursday', startTime: '10:00', endTime: '11:00', title: 'Evaluación Kinésica & ROM', instructor: 'Klgo. Andrés Morales', type: SlotType.KINE_BOX, capacity: 1 },
  'block-8': { dayOfWeek: 'Thursday', startTime: '18:00', endTime: '19:00', title: 'Entrenamiento Funcional Carga Progresiva', instructor: 'Prof. Mike R.', type: SlotType.FUNCTIONAL, capacity: 12 },
  'block-9': { dayOfWeek: 'Friday', startTime: '08:00', endTime: '09:00', title: 'Kinesiología Preventiva', instructor: 'Klga. Valeria Reyes', type: SlotType.KINE_BOX, capacity: 1 },
  'block-10': { dayOfWeek: 'Friday', startTime: '17:00', endTime: '18:00', title: 'Readaptación Funcional Total', instructor: 'Prof. Carlos Vega', type: SlotType.FUNCTIONAL, capacity: 10 },
  'block-11': { dayOfWeek: 'Saturday', startTime: '09:00', endTime: '10:00', title: 'Evaluación & Readaptación Sabatina', instructor: 'Klgo. Andrés Morales', type: SlotType.KINE_BOX, capacity: 1 },
  'block-12': { dayOfWeek: 'Saturday', startTime: '10:30', endTime: '11:30', title: 'Entrenamiento Funcional Fin de Semana', instructor: 'Prof. Mike R.', type: SlotType.FUNCTIONAL, capacity: 10 },
  'block-13': { dayOfWeek: 'Sunday', startTime: '09:30', endTime: '10:30', title: 'Box Kinésico Matinal Dominical', instructor: 'Klgo. Andrés Morales', type: SlotType.KINE_BOX, capacity: 1 },
  'block-14': { dayOfWeek: 'Sunday', startTime: '10:30', endTime: '11:30', title: 'Movilidad & Recuperación Guiada', instructor: 'Prof. Mike R.', type: SlotType.FUNCTIONAL, capacity: 10 },
};

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}
  private async slot(tx: Prisma.TransactionClient, userId: string, blockId: string, value: string, exceptId?: string) {
    let block = await tx.scheduleBlock.findUnique({ where: { id: blockId } });
    if (!block && DEFAULT_SCHEDULE_BLOCKS[blockId]) {
      block = await tx.scheduleBlock.create({
        data: {
          id: blockId,
          ...DEFAULT_SCHEDULE_BLOCKS[blockId],
        },
      });
    }
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!block?.isActive || user?.status !== 'ACTIVE') throw new BadRequestException('Horario o membresía no disponible.');
    const date = value.slice(0, 10);
    const start = appointmentTime(date, block.startTime);
    const end = appointmentTime(date, block.endTime);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || start <= Date.now() || dayNames[new Date(date + 'T12:00:00Z').getUTCDay()] !== block.dayOfWeek) throw new BadRequestException('Selecciona una fecha futura correspondiente a este horario.');
    const reservations = await tx.booking.findMany({ where: { id: exceptId ? { not: exceptId } : undefined, status: { not: 'CANCELLED' }, bookingDate: { gte: new Date(start - 86400000), lte: new Date(end + 86400000) }, OR: [{ userId }, { scheduleBlockId: blockId }] }, include: { scheduleBlock: true } });
    if (reservations.filter(b => b.scheduleBlockId === blockId && today(b.bookingDate) === date).length >= block.capacity) throw new BadRequestException('Cupos agotados en esta fecha.');
    if (reservations.some(b => b.userId === userId && b.bookingDate.getTime() < end && appointmentTime(today(b.bookingDate), b.scheduleBlock.endTime) > start)) throw new BadRequestException('Ya tienes una reserva que coincide con este horario.');
    return { block, user, bookingDate: new Date(start) };
  }
  async create(userId: string, dto: CreateBookingDto) {
    return serial(this.prisma, async tx => {
      const { block, user, bookingDate } = await this.slot(tx, userId, dto.scheduleBlockId, dto.bookingDate);
      const pack = await tx.sessionPackage.findFirst({ where: { userId, isActive: true, remainingSessions: { gt: 0 }, OR: [{ expiresAt: null }, { expiresAt: { gte: bookingDate } }] }, orderBy: { createdAt: 'asc' } });
      if (!pack) throw new BadRequestException('No tienes sesiones vigentes disponibles para esta fecha.');
      await tx.sessionPackage.update({ where: { id: pack.id }, data: { remainingSessions: { decrement: 1 } } });
      const booking = await tx.booking.create({ data: { userId, scheduleBlockId: block.id, bookingDate, packageId: pack.id }, include: { scheduleBlock: true } });
      await tx.activityLog.create({ data: { userId, userName: user.name, action: `reservó ${block.title} para ${today(bookingDate)}` } });
      return { message: 'Reserva confirmada. Se descontó una sesión.', booking, remainingSessions: pack.remainingSessions - 1 };
    });
  }
  findMyBookings(userId: string) { return this.prisma.booking.findMany({ where: { userId }, include: { scheduleBlock: true }, orderBy: { bookingDate: 'desc' } }); }
  async findAll(status?: BookingStatus, date?: string) {
    const bookings = await this.prisma.booking.findMany({ where: status ? { status } : {}, include: { scheduleBlock: true, user: { select: { id: true, name: true, physicalRestrictions: true } } }, orderBy: { bookingDate: 'desc' } });
    return date ? bookings.filter(b => today(b.bookingDate) === date) : bookings;
  }
  private async owned(tx: Prisma.TransactionClient, id: string, user: { id: string; role: Role }) {
    const booking = await tx.booking.findUnique({ where: { id }, include: { scheduleBlock: true, user: true } });
    if (!booking) throw new NotFoundException('Reserva no encontrada.');
    if (booking.userId !== user.id && ![Role.ADMIN, Role.KINESIOLOGO].includes(user.role as any)) throw new ForbiddenException('No puedes modificar esta reserva.');
    if (booking.status !== BookingStatus.RESERVED || booking.bookingDate.getTime() <= Date.now()) throw new BadRequestException('La reserva debe estar pendiente y ser futura.');
    return booking;
  }
  async cancel(id: string, user: { id: string; role: Role; name: string }) {
    return serial(this.prisma, async tx => {
      const booking = await this.owned(tx, id, user);
      const eligible = booking.bookingDate.getTime() - Date.now() >= BOOKING_NOTICE_HOURS * 3600000;
      let isRefunded = false;
      if (eligible) {
        if (!booking.packageId) throw new BadRequestException('Esta reserva antigua requiere conciliación del paquete por el centro antes de cancelar con devolución.');
        const pack = await tx.sessionPackage.findUnique({ where: { id: booking.packageId } });
        if (!pack || pack.userId !== booking.userId || pack.remainingSessions >= pack.totalSessions) throw new BadRequestException('El centro debe revisar el saldo antes de devolver esta sesión.');
        await tx.sessionPackage.update({ where: { id: pack.id }, data: { remainingSessions: { increment: 1 } } });
        isRefunded = true;
      }
      const result = await tx.booking.update({ where: { id }, data: { status: BookingStatus.CANCELLED, cancelledAt: new Date(), isRefunded, confirmedAt: null } });
      await tx.activityLog.create({ data: { userId: booking.userId, userName: booking.user.name, action: `canceló ${booking.scheduleBlock.title} (${isRefunded ? 'sesión devuelta' : 'sin devolución por plazo menor a 24h'})` } });
      return { booking: result, isRefunded, message: isRefunded ? 'Cupo liberado y sesión devuelta al paquete original.' : 'Cupo liberado. Al faltar menos de 24 horas, la sesión no se devuelve.' };
    });
  }
  async reschedule(id: string, user: { id: string; role: Role; name: string }, dto: RescheduleBookingDto) {
    return serial(this.prisma, async tx => {
      const original = await this.owned(tx, id, user);
      if (original.bookingDate.getTime() - Date.now() < BOOKING_NOTICE_HOURS * 3600000) throw new BadRequestException('Para reagendar deben faltar al menos 24 horas.');
      const { block, bookingDate } = await this.slot(tx, original.userId, dto.newScheduleBlockId, dto.newBookingDate, id);
      if (original.packageId) { const pack = await tx.sessionPackage.findUnique({ where: { id: original.packageId } }); if (pack?.expiresAt && pack.expiresAt < bookingDate) throw new BadRequestException('La nueva fecha supera la vigencia del paquete.'); }
      const booking = await tx.booking.update({ where: { id }, data: { scheduleBlockId: block.id, bookingDate, confirmedAt: null } });
      return { message: 'Reserva reagendada sin alterar el saldo.', booking };
    });
  }
  async confirm(id: string, user: { id: string; role: Role }) {
    return serial(this.prisma, async tx => {
      const booking = await this.owned(tx, id, user);
      if (booking.userId !== user.id) throw new ForbiddenException('La confirmación corresponde al alumno.');
      return tx.booking.update({ where: { id }, data: { confirmedAt: booking.confirmedAt || new Date() } });
    });
  }
  async updateAttendance(id: string, status: BookingStatus, staffName = 'Staff') {
    if (![BookingStatus.RESERVED, BookingStatus.ATTENDED, BookingStatus.NO_SHOW].includes(status as any)) throw new BadRequestException('Estado de asistencia inválido.');
    return serial(this.prisma, async tx => {
      const booking = await tx.booking.findUnique({ where: { id }, include: { user: true, scheduleBlock: true } });
      if (!booking || booking.status === 'CANCELLED' || booking.bookingDate.getTime() > Date.now()) throw new BadRequestException('La clase debe haber comenzado y la reserva no puede estar cancelada.');
      const updated = await tx.booking.update({ where: { id }, data: { status } });
      if (booking.status !== status) await tx.activityLog.create({ data: { userId: booking.userId, userName: staffName, action: `registró ${status} para ${booking.user.name} en ${booking.scheduleBlock.title}` } });
      return updated;
    });
  }
}
