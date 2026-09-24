import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlockDto, UpdateBlockDto } from './dto/schedule-block.dto';
import { SlotType } from '@prisma/client';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  async findAll(dayOfWeek?: string, type?: SlotType, onlyActive = true) {
    return this.prisma.scheduleBlock.findMany({
      where: {
        ...(dayOfWeek ? { dayOfWeek } : {}),
        ...(type ? { type } : {}),
        ...(onlyActive ? { isActive: true } : {}),
      },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findOne(id: string) {
    const block = await this.prisma.scheduleBlock.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true, physicalRestrictions: true },
            },
          },
        },
      },
    });

    if (!block) {
      throw new NotFoundException(`Bloque de horario con ID ${id} no encontrado`);
    }

    return block;
  }

  async create(dto: CreateBlockDto, authorName = 'Administrador') {
    const block = await this.prisma.scheduleBlock.create({
      data: {
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        title: dto.title,
        instructor: dto.instructor,
        type: dto.type || SlotType.KINE_BOX,
        capacity: dto.capacity,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        userName: authorName,
        action: `creó el bloque ${block.title} (${block.dayOfWeek} ${block.startTime}-${block.endTime})`,
      },
    });

    return block;
  }

  async update(id: string, dto: UpdateBlockDto, authorName = 'Administrador') {
    await this.findOne(id);

    const updated = await this.prisma.scheduleBlock.update({
      where: { id },
      data: dto,
    });

    await this.prisma.activityLog.create({
      data: {
        userName: authorName,
        action: `modificó la configuración del bloque ${updated.title}`,
      },
    });

    return updated;
  }

  async remove(id: string, authorName = 'Administrador') {
    const block = await this.findOne(id);

    const activeBookingsCount = await this.prisma.booking.count({
      where: {
        scheduleBlockId: id,
        status: 'RESERVED',
        bookingDate: { gte: new Date() },
      },
    });

    if (activeBookingsCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar el bloque porque tiene ${activeBookingsCount} reserva(s) activa(s) programada(s). Desactívelo en su lugar.`,
      );
    }

    await this.prisma.scheduleBlock.delete({ where: { id } });

    await this.prisma.activityLog.create({
      data: {
        userName: authorName,
        action: `eliminó el bloque ${block.title} (${block.dayOfWeek})`,
      },
    });

    return { message: 'Bloque eliminado correctamente' };
  }

  async getDailyGrid(dateStr: string) {
    // Parsear la fecha como UTC para evitar desfase de zona horaria
    const targetDate = new Date(`${dateStr}T00:00:00.000Z`);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[targetDate.getUTCDay()];

    // Crear copias independientes para no mutar targetDate
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const blocks = await this.prisma.scheduleBlock.findMany({
      where: {
        dayOfWeek,
        isActive: true,
      },
      include: {
        bookings: {
          where: {
            bookingDate: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
                physicalRestrictions: true,
              },
            },
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return blocks.map((block) => ({
      id: block.id,
      title: block.title,
      instructor: block.instructor,
      time: `${block.startTime} - ${block.endTime}`,
      type: block.type,
      capacity: block.capacity,
      bookedCount: block.bookings.filter((b) => b.status === 'RESERVED' || b.status === 'ATTENDED').length,
      students: block.bookings.map((b) => ({
        bookingId: b.id,
        studentId: b.user.id,
        name: b.user.name,
        restrictions: b.user.physicalRestrictions,
        status: b.status,
      })),
    }));
  }
}
