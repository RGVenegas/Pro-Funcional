import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, status?: string) {
    const where: Prisma.UserWhereInput = {};
    if (status) where.status = status as Prisma.EnumMemberStatusFilter;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const members = await this.prisma.user.findMany({
      where,
      include: {
        packages: {
          where: { isActive: true },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    });

    return members.map(({ password, ...m }) => ({
      ...m,
      activePackage: m.packages[0] || null,
    }));
  }

  async findOne(id: string) {
    const member = await this.prisma.user.findUnique({
      where: { id },
      include: {
        packages: {
          orderBy: { createdAt: 'desc' },
        },
        clinicalRecords: {
          orderBy: { date: 'desc' },
        },
        bookings: {
          include: { scheduleBlock: true },
          orderBy: { bookingDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!member) {
      throw new NotFoundException(`Miembro con ID ${id} no encontrado`);
    }

    const { password, ...safeMember } = member;
    return safeMember;
  }

  async update(id: string, dto: UpdateMemberDto, authorName = 'Staff') {
    await this.findOne(id);

    const updated = await this.prisma.user.update({
      where: { id },
      data: dto,
    });

    await this.prisma.activityLog.create({
      data: {
        userId: id,
        userName: authorName,
        action: `actualizó la ficha de ${updated.name}`,
      },
    });

    const { password, ...safe } = updated;
    return safe;
  }

  async getRecentActivities(limit = 10) {
    return this.prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
