import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { SlotType } from '@prisma/client';

export class CreateBlockDto {
  @ApiProperty({ example: 'Monday', description: 'Día de la semana' })
  @IsString()
  @IsNotEmpty({ message: 'El día de la semana es requerido' })
  dayOfWeek: string;

  @ApiProperty({ example: '08:00', description: 'Hora de inicio (HH:mm)' })
  @IsString()
  @IsNotEmpty({ message: 'La hora de inicio es requerida' })
  startTime: string;

  @ApiProperty({ example: '09:00', description: 'Hora de término (HH:mm)' })
  @IsString()
  @IsNotEmpty({ message: 'La hora de término es requerida' })
  endTime: string;

  @ApiProperty({ example: 'Box Clínico Kinesiología 1', description: 'Nombre o título del bloque' })
  @IsString()
  @IsNotEmpty({ message: 'El título es requerido' })
  title: string;

  @ApiProperty({ example: 'Klgo. Andrés Morales', description: 'Profesional / Instructor a cargo' })
  @IsString()
  @IsNotEmpty({ message: 'El instructor es requerido' })
  instructor: string;

  @ApiPropertyOptional({ enum: SlotType, default: SlotType.KINE_BOX, description: 'Tipo de bloque (Box o Funcional)' })
  @IsOptional()
  @IsEnum(SlotType)
  type?: SlotType;

  @ApiProperty({ example: 1, default: 1, description: 'Capacidad máxima de cupos' })
  @IsInt()
  @Min(1, { message: 'La capacidad debe ser de al menos 1 cupo' })
  capacity: number;
}

export class UpdateBlockDto {
  @ApiPropertyOptional({ example: '08:00' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ example: '09:00' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ example: 'Box Clínico Kinesiología 1' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Klgo. Andrés Morales' })
  @IsOptional()
  @IsString()
  instructor?: string;

  @ApiPropertyOptional({ enum: SlotType })
  @IsOptional()
  @IsEnum(SlotType)
  type?: SlotType;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
