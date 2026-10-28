import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Conexión establecida con la base de datos PostgreSQL.');
    } catch (error: any) {
      this.logger.warn(`⚠️ No se pudo conectar a PostgreSQL en onModuleInit: ${error?.message || error}`);
      this.logger.warn('ℹ️ El servidor continuará operando. Verifique la variable DATABASE_URL en backend/.env.');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

