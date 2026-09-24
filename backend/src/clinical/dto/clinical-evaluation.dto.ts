import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateClinicalEvaluationDto {
  @ApiProperty({ example: '4', description: 'Nivel de dolor en escala EVA (1 a 10)' })
  @IsInt()
  @Min(1, { message: 'El valor de EVA debe ser entre 1 y 10' })
  @Max(10, { message: 'El valor de EVA debe ser entre 1 y 10' })
  evaPain: number;

  @ApiProperty({ example: 120, description: 'Rango de Movimiento Articular en Grados (°)' })
  @IsInt()
  @Min(0, { message: 'Los grados ROM deben ser mayores o iguales a 0' })
  @Max(360, { message: 'Los grados ROM no deben exceder 360' })
  romDegrees: number;

  @ApiProperty({ example: 'Rodilla derecha', description: 'Zona anatómica evaluada' })
  @IsString()
  @IsNotEmpty({ message: 'La articulación o zona anatómica es requerida' })
  jointOrArea: string;

  @ApiProperty({ example: 'Paciente refiere disminución del dolor al apoyar el pie.', description: 'SOAP: Subjetivo' })
  @IsString()
  @IsNotEmpty()
  subjective: string;

  @ApiProperty({ example: 'Sin signos de flogosis. ROM flexión 120°.', description: 'SOAP: Objetivo' })
  @IsString()
  @IsNotEmpty()
  objective: string;

  @ApiProperty({ example: 'Tendinopatía en fase de resolución.', description: 'SOAP: Análisis / Evaluación' })
  @IsString()
  @IsNotEmpty()
  assessment: string;

  @ApiProperty({ example: 'Fortalecimiento excéntrico y derivación a funcional.', description: 'SOAP: Plan' })
  @IsString()
  @IsNotEmpty()
  plan: string;

  @ApiPropertyOptional({ example: 'Evitar sentadillas profundas >90°', description: 'Restricciones físicas actualizadas para entrenadores' })
  @IsOptional()
  @IsString()
  physicalRestrictions?: string;
}
