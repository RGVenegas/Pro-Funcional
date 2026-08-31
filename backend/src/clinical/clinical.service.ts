import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClinicalEvaluationDto } from './dto/clinical-evaluation.dto';

@Injectable()
export class ClinicalService {
  constructor(private prisma: PrismaService) {}

  async createEvaluation(
    patientId: string,
    professionalId: string,
    professionalName: string,
    dto: CreateClinicalEvaluationDto,
  ) {
    const patient = await this.prisma.user.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Crear registro clínico
      const evalRecord = await tx.clinicalEvaluation.create({
        data: {
          patientId,
          professionalId,
          professionalName,
          evaPain: dto.evaPain,
          romDegrees: dto.romDegrees,
          jointOrArea: dto.jointOrArea,
          subjective: dto.subjective,
          objective: dto.objective,
          assessment: dto.assessment,
          plan: dto.plan,
          physicalRestrictions: dto.physicalRestrictions,
        },
      });

      // 2. Actualizar restricciones globales del paciente si se especifican
      if (dto.physicalRestrictions !== undefined) {
        await tx.user.update({
          where: { id: patientId },
          data: {
            physicalRestrictions: dto.physicalRestrictions,
          },
        });
      }

      // 3. Registrar actividad
      await tx.activityLog.create({
        data: {
          userId: patientId,
          userName: patient.name,
          action: `registró evaluación kinésica (EVA: ${dto.evaPain}/10 - ROM: ${dto.romDegrees}° en ${dto.jointOrArea}) por ${professionalName}`,
        },
      });

      return evalRecord;
    });
  }

  async getPatientHistory(patientId: string) {
    const records = await this.prisma.clinicalEvaluation.findMany({
      where: { patientId },
      orderBy: { date: 'desc' },
    });

    // Formatear datos para curvas de Recharts
    const chartData = [...records].reverse().map((r, idx) => ({
      session: `Sesión ${idx + 1}`,
      date: r.date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }),
      evaPain: r.evaPain,
      romDegrees: r.romDegrees,
      jointOrArea: r.jointOrArea,
      note: r.assessment,
    }));

    return {
      history: records,
      chartData,
    };
  }
}
