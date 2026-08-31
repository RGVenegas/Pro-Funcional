import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { MemberStatus } from '@prisma/client';

@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService) {}

  async assignPackage(userId: string, dto: CreatePackageDto, authorName = 'Administrador') {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Desactivar paquetes anteriores
    await this.prisma.sessionPackage.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const newPackage = await this.prisma.sessionPackage.create({
      data: {
        userId,
        plan: dto.plan,
        packName: dto.packName,
        totalSessions: dto.totalSessions,
        remainingSessions: dto.totalSessions,
        price: dto.price,
        expiresAt,
        isActive: true,
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: MemberStatus.ACTIVE,
        nextBilling: expiresAt,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        userId,
        userName: user.name,
        action: `adquirió ${newPackage.packName} (${newPackage.totalSessions} sesiones)`,
      },
    });

    return newPackage;
  }

  async getMyActivePackage(userId: string) {
    const pkg = await this.prisma.sessionPackage.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!pkg) {
      return {
        hasActivePackage: false,
        remainingSessions: 0,
        totalSessions: 0,
      };
    }

    return {
      hasActivePackage: true,
      ...pkg,
    };
  }

  async renewPackage(userId: string, authorName = 'Administrador') {
    const lastPackage = await this.prisma.sessionPackage.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!lastPackage) {
      throw new BadRequestException('El usuario no tiene un paquete previo para renovar');
    }

    return this.assignPackage(
      userId,
      {
        plan: lastPackage.plan,
        packName: lastPackage.packName,
        totalSessions: lastPackage.totalSessions,
        price: lastPackage.price,
      },
      authorName,
    );
  }
}
