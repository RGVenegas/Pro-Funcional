import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto, RescheduleBookingDto } from './dto/booking.dto';
import { BookingStatus, Prisma, Role } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBookingDto) {
    const bookingDateTime = new Date(dto.bookingDate);

    return this.prisma.$transaction(async (tx) => {
      // 1. Validar existencia del bloque
      const block = await tx.scheduleBlock.findUnique({
        where: { id: dto.scheduleBlockId },
      });

      if (!block || !block.isActive) {
        throw new NotFoundException('El bloque horario solicitado no existe o no está activo');
      }

      // 2. Comprobar cupos disponibles para ese día y bloque
      const startOfDay = new Date(bookingDateTime);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(bookingDateTime);
      endOfDay.setHours(23, 59, 59, 999);

      const currentBookingsCount = await tx.booking.count({
        where: {
          scheduleBlockId: dto.scheduleBlockId,
          bookingDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: { in: [BookingStatus.RESERVED, BookingStatus.ATTENDED] },
        },
      });

      if (currentBookingsCount >= block.capacity) {
        throw new BadRequestException('Cupos agotados: Este bloque horario ya ha alcanzado su capacidad máxima');
      }

      // 3. Comprobar si el usuario ya tiene reserva en este bloque para ese día
      const alreadyBooked = await tx.booking.findFirst({
        where: {
          userId,
          scheduleBlockId: dto.scheduleBlockId,
          bookingDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: { in: [BookingStatus.RESERVED, BookingStatus.ATTENDED] },
        },
      });

      if (alreadyBooked) {
        throw new BadRequestException('Ya posees una reserva activa en este mismo bloque para la fecha seleccionada');
      }

      // 4. Comprobar saldo de sesiones en el paquete activo (HU-03 Escenario 2)
      const userPackage = await tx.sessionPackage.findFirst({
        where: {
          userId,
          isActive: true,
          remainingSessions: { gt: 0 },
        },
        orderBy: { createdAt: 'asc' },
      });

      if (!userPackage) {
        throw new BadRequestException(
          'Saldo insuficiente (0 sesiones disponibles). Debes adquirir o renovar un paquete de sesiones para continuar.',
        );
      }

      // 5. Decrementar 1 sesión atómicamente
      const updatedPackage = await tx.sessionPackage.update({
        where: { id: userPackage.id },
        data: {
          remainingSessions: userPackage.remainingSessions - 1,
        },
      });

      // 6. Crear la reserva
      const booking = await tx.booking.create({
        data: {
          userId,
          scheduleBlockId: dto.scheduleBlockId,
          bookingDate: bookingDateTime,
          status: BookingStatus.RESERVED,
        },
        include: {
          scheduleBlock: true,
        },
      });

      const user = await tx.user.findUnique({ where: { id: userId } });

      await tx.activityLog.create({
        data: {
          userId,
          userName: user?.name || 'Alumno',
          action: `reservó "${block.title}" para el ${bookingDateTime.toLocaleDateString('es-CL')} (Saldo restante: ${updatedPackage.remainingSessions})`,
        },
      });

      return {
        message: 'Reserva confirmada exitosamente',
        booking,
        remainingSessions: updatedPackage.remainingSessions,
      };
    });
  }

  async findMyBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        scheduleBlock: true,
      },
      orderBy: { bookingDate: 'desc' },
    });
  }

  async findAll(status?: BookingStatus, date?: string) {
    const where: Prisma.BookingWhereInput = {};
    if (status) where.status = status;
    if (date) {
      const d = new Date(date);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));
      where.bookingDate = { gte: startOfDay, lte: endOfDay };
    }

    return this.prisma.booking.findMany({
      where,
      include: {
        scheduleBlock: true,
        user: {
          select: { id: true, name: true, email: true, phone: true, physicalRestrictions: true },
        },
      },
      orderBy: { bookingDate: 'desc' },
    });
  }

  async cancel(bookingId: string, currentUser: { id: string; role: Role; name: string }) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { scheduleBlock: true, user: true },
    });

    if (!booking) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (currentUser.role === Role.PATIENT && booking.userId !== currentUser.id) {
      throw new ForbiddenException('No tienes permiso para cancelar esta reserva');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Esta reserva ya se encuentra cancelada');
    }

    // Regla de 24 horas para reembolso (CU-03 / HU-04)
    const now = new Date();
    const appointmentDate = new Date(booking.bookingDate);
    const diffHours = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    const isEligibleForRefund = diffHours >= 24 || currentUser.role === Role.ADMIN || currentUser.role === Role.KINESIOLOGO;

    return this.prisma.$transaction(async (tx) => {
      let refundMessage = '';

      if (isEligibleForRefund) {
        // Reembolsar 1 sesión
        const userPackage = await tx.sessionPackage.findFirst({
          where: { userId: booking.userId, isActive: true },
          orderBy: { createdAt: 'desc' },
        });

        if (userPackage) {
          const newRemaining = Math.min(userPackage.totalSessions, userPackage.remainingSessions + 1);
          await tx.sessionPackage.update({
            where: { id: userPackage.id },
            data: { remainingSessions: newRemaining },
          });
        }

        refundMessage = 'Cita cancelada a tiempo. Se ha reembolsado 1 sesión a tu saldo.';
      } else {
        refundMessage = 'Cita cancelada fuera del plazo límite (menos de 24 horas). La sesión no es reembolsable.';
      }

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CANCELLED,
          isRefunded: isEligibleForRefund,
          cancelledAt: now,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: booking.userId,
          userName: booking.user.name,
          action: `canceló su cita de ${booking.scheduleBlock.title} (${isEligibleForRefund ? 'Reembolsada' : 'Sin reembolso'})`,
        },
      });

      return {
        message: refundMessage,
        booking: updated,
        isRefunded: isEligibleForRefund,
      };
    });
  }

  async reschedule(bookingId: string, currentUser: { id: string; role: Role; name: string }, dto: RescheduleBookingDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { scheduleBlock: true, user: true },
    });

    if (!booking) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (currentUser.role === Role.PATIENT && booking.userId !== currentUser.id) {
      throw new ForbiddenException('No tienes permiso para reagendar esta reserva');
    }

    if (booking.status !== BookingStatus.RESERVED) {
      throw new BadRequestException('Solo es posible reagendar citas en estado Reservada');
    }

    const newDate = new Date(dto.newBookingDate);

    return this.prisma.$transaction(async (tx) => {
      // 1. Validar nuevo bloque
      const newBlock = await tx.scheduleBlock.findUnique({
        where: { id: dto.newScheduleBlockId },
      });

      if (!newBlock || !newBlock.isActive) {
        throw new NotFoundException('El nuevo bloque horario no está disponible');
      }

      // 2. Validar cupos en nuevo bloque
      const startOfDay = new Date(newDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(newDate);
      endOfDay.setHours(23, 59, 59, 999);

      const count = await tx.booking.count({
        where: {
          scheduleBlockId: dto.newScheduleBlockId,
          bookingDate: { gte: startOfDay, lte: endOfDay },
          status: { in: [BookingStatus.RESERVED, BookingStatus.ATTENDED] },
        },
      });

      if (count >= newBlock.capacity) {
        throw new BadRequestException('Cupos agotados en el nuevo horario seleccionado');
      }

      // 3. Reagendar (sin descontar ni reembolsar sesiones)
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          scheduleBlockId: dto.newScheduleBlockId,
          bookingDate: newDate,
        },
        include: { scheduleBlock: true },
      });

      await tx.activityLog.create({
        data: {
          userId: booking.userId,
          userName: booking.user.name,
          action: `reagendó su cita a ${newBlock.title} para el ${newDate.toLocaleDateString('es-CL')}`,
        },
      });

      return {
        message: 'Cita reagendada con éxito',
        booking: updated,
      };
    });
  }

  async updateAttendance(bookingId: string, status: BookingStatus, staffName = 'Staff') {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, scheduleBlock: true },
    });

    if (!booking) {
      throw new NotFoundException('Reserva no encontrada');
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    const statusLabel = status === BookingStatus.ATTENDED ? 'marcó como Asistió' : 'marcó como No-Show';

    await this.prisma.activityLog.create({
      data: {
        userName: staffName,
        action: `${statusLabel} a ${booking.user.name} en ${booking.scheduleBlock.title}`,
      },
    });

    return updated;
  }
}
