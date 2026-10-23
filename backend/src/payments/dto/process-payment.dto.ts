import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessPaymentDto {
  @ApiProperty({ description: 'Token de la tarjeta generado por Payment Brick' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'ID del método de pago (visa, master, etc.)' })
  @IsString()
  @IsNotEmpty()
  payment_method_id: string;

  @ApiProperty({ description: 'Monto de la transacción en CLP', example: 250000 })
  @IsNumber()
  transaction_amount: number;

  @ApiProperty({ description: 'Número de cuotas', example: 1 })
  @IsNumber()
  installments: number;

  @ApiProperty({ description: 'ID del emisor de la tarjeta', required: false })
  @IsOptional()
  @IsString()
  issuer_id?: string;

  @ApiProperty({ description: 'Descripción de la compra' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Datos del pagador' })
  @IsNotEmpty()
  payer: {
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };

  @ApiProperty({ description: 'ID del servicio o paquete de ProFuncional', required: false })
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiProperty({ description: 'Cantidad de sesiones a acreditar', required: false })
  @IsOptional()
  @IsNumber()
  sessions?: number;

  @ApiProperty({ description: 'ID del miembro paciente a quien acreditar sesiones', required: false })
  @IsOptional()
  @IsString()
  memberId?: string;
}
