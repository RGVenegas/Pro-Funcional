import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { PrismaService } from '../prisma/prisma.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { MembershipPlan } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private client: MercadoPagoConfig;
  private paymentClient: Payment;

  constructor(private readonly prisma: PrismaService) {
    const accessToken = process.env.MP_ACCESS_TOKEN || '';
    if (!accessToken) {
      this.logger.warn('⚠️ MP_ACCESS_TOKEN no está definido en variables de entorno.');
    }
    this.client = new MercadoPagoConfig({ accessToken });
    this.paymentClient = new Payment(this.client);
  }

  async processPayment(dto: ProcessPaymentDto, authUserId?: string) {
    try {
      this.logger.log(`Iniciando cobro Mercado Pago por $${dto.transaction_amount} CLP para ${dto.payer.email}`);

      const body: any = {
        token: dto.token,
        payment_method_id: dto.payment_method_id,
        transaction_amount: Number(dto.transaction_amount),
        installments: Number(dto.installments) || 1,
        description: dto.description || 'Servicio ProFuncional',
        payer: {
          email: dto.payer.email,
        },
      };

      if (dto.issuer_id) {
        body.issuer_id = dto.issuer_id;
      }

      if (dto.payer.identification?.number) {
        body.payer.identification = dto.payer.identification;
      }

      const paymentResponse = await this.paymentClient.create({ body });
      this.logger.log(`Respuesta de Mercado Pago: status=${paymentResponse.status}, id=${paymentResponse.id}`);

      // Si el pago fue aprobado, acreditar sesiones en Neon
      if (paymentResponse.status === 'approved') {
        await this.accreditSessions(dto, authUserId);
      }

      return {
        success: paymentResponse.status === 'approved',
        status: paymentResponse.status,
        status_detail: paymentResponse.status_detail,
        id: paymentResponse.id,
        payment_method_id: paymentResponse.payment_method_id,
        transaction_amount: paymentResponse.transaction_amount,
        installments: paymentResponse.installments,
      };
    } catch (error: any) {
      this.logger.error('Error procesando pago con Mercado Pago:', error);
      const msg = error?.message || error?.cause?.description || 'Error procesando el pago en Mercado Pago.';
      throw new BadRequestException(msg);
    }
  }

  async handleWebhook(body: any) {
    this.logger.log(`Webhook Mercado Pago recibido: ${JSON.stringify(body)}`);
    return { received: true };
  }

  private async accreditSessions(dto: ProcessPaymentDto, authUserId?: string) {
    try {
      const targetUserId = dto.memberId || authUserId;
      if (!targetUserId && !dto.payer.email) return;

      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            ...(targetUserId ? [{ id: targetUserId }] : []),
            ...(dto.payer.email ? [{ email: dto.payer.email }] : []),
          ],
        },
      });

      if (!user) {
        this.logger.warn(`No se encontró usuario para acreditar sesiones: ${targetUserId} / ${dto.payer.email}`);
        return;
      }

      const sessionsToAdd = dto.sessions || 1;
      const packName = dto.description || 'Paquete de Sesiones';

      // Crear o renovar paquete activo
      await this.prisma.sessionPackage.create({
        data: {
          userId: user.id,
          packName,
          plan: MembershipPlan.PREMIUM,
          totalSessions: sessionsToAdd,
          remainingSessions: sessionsToAdd,
          price: Number(dto.transaction_amount),
          isActive: true,
        },
      });

      // Registrar en log de actividades
      await this.prisma.activityLog.create({
        data: {
          userId: user.id,
          userName: user.name,
          action: `Acreditación automática de ${sessionsToAdd} sesiones vía Checkout Mercado Pago (${packName}).`,
        },
      });

      this.logger.log(`Acreditadas ${sessionsToAdd} sesiones exitosamente a ${user.name} (${user.email})`);
    } catch (e) {
      this.logger.error('Error acreditando sesiones post-pago:', e);
    }
  }
}
