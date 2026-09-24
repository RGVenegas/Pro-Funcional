import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Paquetes de Sesiones y Saldo')
@Controller('packages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get('my')
  @ApiOperation({ summary: 'Consultar saldo y paquete activo del usuario autenticado' })
  getMyPackage(@GetUser('id') userId: string) {
    return this.packagesService.getMyActivePackage(userId);
  }

  @Post('assign/:userId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.KINESIOLOGO)
  @ApiOperation({ summary: 'Asignar un nuevo paquete a un paciente' })
  assignPackage(
    @Param('userId') userId: string,
    @Body() dto: CreatePackageDto,
    @GetUser('name') authorName: string,
  ) {
    return this.packagesService.assignPackage(userId, dto, authorName);
  }

  @Post('renew/:userId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.KINESIOLOGO)
  @ApiOperation({ summary: 'Renovar el último paquete del paciente (acreditar sesiones completas)' })
  renewPackage(@Param('userId') userId: string, @GetUser('name') authorName: string) {
    return this.packagesService.renewPackage(userId, authorName);
  }
}
