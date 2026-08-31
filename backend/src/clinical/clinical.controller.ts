import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClinicalService } from './clinical.service';
import { CreateClinicalEvaluationDto } from './dto/clinical-evaluation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Fichas Clínicas Kinésicas (SOAP, EVA & ROM)')
@Controller('clinical')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClinicalController {
  constructor(private readonly clinicalService: ClinicalService) {}

  @Post('evaluations/:patientId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.KINESIOLOGO)
  @ApiOperation({ summary: 'Registrar evaluación clínica SOAP con EVA y ROM (HU-05)' })
  createEvaluation(
    @Param('patientId') patientId: string,
    @GetUser('id') professionalId: string,
    @GetUser('name') professionalName: string,
    @Body() dto: CreateClinicalEvaluationDto,
  ) {
    return this.clinicalService.createEvaluation(patientId, professionalId, professionalName, dto);
  }

  @Get('history/:patientId')
  @ApiOperation({ summary: 'Obtener historial clínico y curvas de progreso (HU-06)' })
  getPatientHistory(@Param('patientId') patientId: string) {
    return this.clinicalService.getPatientHistory(patientId);
  }

  @Get('my-history')
  @ApiOperation({ summary: 'Obtener historial y gráficos del paciente autenticado' })
  getMyHistory(@GetUser('id') userId: string) {
    return this.clinicalService.getPatientHistory(userId);
  }
}
