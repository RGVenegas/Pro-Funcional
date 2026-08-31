import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'b1234567-89ab-cdef-0123-456789abcdef', description: 'ID del bloque horario' })
  @IsUUID('4', { message: 'El ID del bloque debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del bloque es requerido' })
  scheduleBlockId: string;

  @ApiProperty({ example: '2026-09-07T08:00:00.000Z', description: 'Fecha de la cita' })
  @IsDateString({}, { message: 'La fecha de agendamiento debe tener formato ISO válido' })
  @IsNotEmpty({ message: 'La fecha de agendamiento es requerida' })
  bookingDate: string;
}

export class RescheduleBookingDto {
  @ApiProperty({ example: 'b1234567-89ab-cdef-0123-456789abcdef', description: 'Nuevo ID de bloque horario' })
  @IsUUID('4', { message: 'El ID del bloque debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El nuevo ID de bloque es requerido' })
  newScheduleBlockId: string;

  @ApiProperty({ example: '2026-09-09T08:00:00.000Z', description: 'Nueva fecha de agendamiento' })
  @IsDateString({}, { message: 'La nueva fecha debe tener formato ISO válido' })
  @IsNotEmpty({ message: 'La nueva fecha es requerida' })
  newBookingDate: string;
}
