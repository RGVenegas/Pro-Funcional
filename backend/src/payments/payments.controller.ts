import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@ApiTags('Pagos (Mercado Pago Checkout API / Bricks)')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('process')
  @ApiOperation({ summary: 'Procesar cobro con tarjeta o medio de pago desde Payment Brick' })
  @ApiResponse({ status: 200, description: 'Pago procesado exitosamente' })
  async processPayment(@Body() dto: ProcessPaymentDto, @Req() req: any) {
    const authUserId = req.user?.id;
    return this.paymentsService.processPayment(dto, authUserId);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Recibir notificaciones en tiempo real (IPN / Webhook) de Mercado Pago' })
  async handleWebhook(@Body() body: any) {
    return this.paymentsService.handleWebhook(body);
  }
}
