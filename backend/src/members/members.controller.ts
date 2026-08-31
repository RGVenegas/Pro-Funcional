import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { UpdateMemberDto } from './dto/update-member.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Directorio de Miembros y Pacientes')
@Controller('members')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.KINESIOLOGO, Role.COACH)
  @ApiOperation({ summary: 'Listar todos los pacientes y miembros (Staff)' })
  @ApiQuery({ name: 'search', required: false, example: 'Camila' })
  @ApiQuery({ name: 'status', required: false, example: 'ACTIVE' })
  findAll(@Query('search') search?: string, @Query('status') status?: string) {
    return this.membersService.findAll(search, status);
  }

  @Get('activities')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener registro de actividad reciente del gimnasio (Solo Admin)' })
  getActivities() {
    return this.membersService.getRecentActivities();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.KINESIOLOGO, Role.COACH)
  @ApiOperation({ summary: 'Obtener detalle completo de un miembro con historial clínico (Solo Staff)' })
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.KINESIOLOGO)
  @ApiOperation({ summary: 'Actualizar datos personales o restricciones físicas' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMemberDto,
    @GetUser('name') authorName: string,
  ) {
    return this.membersService.update(id, dto, authorName);
  }
}
