import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { MembershipPlan } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly accessToken: string;

  constructor(private readonly prisma: PrismaService) {
    this.accessToken = process.env.MP_ACCESS_TOKEN || '';
    if (!this.accessToken) {
      this.logger.warn('⚠️ MP_ACCESS_TOKEN no está definido en variables de entorno.');
    }
  }

  async processPayment(dto: ProcessPaymentDto, authUserId?: string) {
    try {
      this.logger.log(`Iniciando cobro vía Orders API Mercado Pago por $${dto.transaction_amount} CLP para ${dto.payer.email}`);

      // Detectar automáticamente si es tarjeta de débito o crédito
      const isDebit =
        dto.payment_method_id?.toLowerCase().includes('deb') ||
        (dto as any).payment_type_id === 'debit_card';

      const paymentMethodType = isDebit ? 'debit_card' : 'credit_card';
      const installmentsCount = isDebit ? 1 : (Number(dto.installments) || 1);

      const orderPayload = {
        type: 'online',
        processing_mode: 'automatic',
        external_reference: `PROFUNCIONAL-${Date.now()}`,
        total_amount: String(Math.round(dto.transaction_amount)),
        items: [
          {
            title: dto.description || 'Servicio ProFuncional',
            unit_price: String(Math.round(dto.transaction_amount)),
            quantity: 1,
          },
        ],
        transactions: {
          payments: [
            {
              payment_method: {
                id: dto.payment_method_id,
                type: paymentMethodType,
                token: dto.token,
                installments: installmentsCount,
              },
              amount: String(Math.round(dto.transaction_amount)),
            },
          ],
        },
        payer: {
          email: dto.payer.email || 'test_user_7198116789143971735@testuser.com',
        },
      };

      const res = await fetch('https://api.mercadopago.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
          'X-Idempotency-Key': `order-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        },
        body: JSON.stringify(orderPayload),
      });

      const orderResponse = await res.json();

      if (!res.ok) {
        this.logger.error('Respuesta de error de Mercado Pago Orders API:', JSON.stringify(orderResponse));
        const errDetail = orderResponse.message || orderResponse.errors?.[0]?.message || 'Error procesando la orden en Mercado Pago.';
        throw new BadRequestException(errDetail);
      }

      this.logger.log(`Orden procesada en Mercado Pago: ID=${orderResponse.id}, status=${orderResponse.status}`);

      const paymentResult = orderResponse.transactions?.payments?.[0];
      const isApproved =
        orderResponse.status === 'processed' ||
        paymentResult?.status === 'processed' ||
        paymentResult?.status === 'approved';

      const paymentId = paymentResult?.id || orderResponse.id;

      // Si el pago fue aprobado, acreditar sesiones en Neon
      if (isApproved) {
        await this.accreditSessions(dto, authUserId);
      }

      return {
        success: isApproved,
        status: isApproved ? 'approved' : orderResponse.status,
        status_detail: paymentResult?.status_detail || orderResponse.status_detail || 'accredited',
        id: paymentId,
        payment_method_id: dto.payment_method_id,
        transaction_amount: dto.transaction_amount,
        installments: dto.installments,
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
