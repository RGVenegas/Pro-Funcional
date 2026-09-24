import { Prisma } from '@prisma/client';
import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export async function serial<T>(prisma: PrismaService, work: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try { return await prisma.$transaction(work, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }); }
    catch (error) { if (error?.code !== 'P2034') throw error; }
  }
  throw new ConflictException('Otro usuario modificó la disponibilidad. Actualiza e inténtalo nuevamente.');
}
