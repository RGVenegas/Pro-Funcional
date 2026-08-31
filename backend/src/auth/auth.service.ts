import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { MembershipPlan, Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new BadRequestException('El correo ya se encuentra registrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const plan = dto.plan || MembershipPlan.STANDARD;

    const planSessions: Record<MembershipPlan, { total: number; price: number; name: string }> = {
      [MembershipPlan.BASIC]: { total: 4, price: 29000, name: 'Pack Básico Kinesiológico (4 ses)' },
      [MembershipPlan.STANDARD]: { total: 8, price: 59000, name: 'Pack Recuperación Activa (8 ses)' },
      [MembershipPlan.PREMIUM]: { total: 12, price: 99000, name: 'Pack Readaptación Total (12 ses)' },
    };

    const selected = planSessions[plan];

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        name: dto.name,
        phone: dto.phone,
        role: dto.role || Role.PATIENT,
        packages: {
          create: {
            plan: plan,
            packName: selected.name,
            totalSessions: selected.total,
            remainingSessions: selected.total,
            price: selected.price,
          },
        },
      },
      include: {
        packages: true,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        action: `se registró como nuevo miembro con ${selected.name}`,
      },
    });

    const token = this.generateToken(user.id, user.email, user.role);
    const { password, ...safeUser } = user;

    return {
      user: safeUser,
      accessToken: token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { packages: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas: correo no registrado');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas: contraseña incorrecta');
    }

    const token = this.generateToken(user.id, user.email, user.role);
    const { password, ...safeUser } = user;

    return {
      user: safeUser,
      accessToken: token,
    };
  }

  private generateToken(userId: string, email: string, role: string): string {
    return this.jwtService.sign({
      sub: userId,
      email,
      role,
    });
  }
}
