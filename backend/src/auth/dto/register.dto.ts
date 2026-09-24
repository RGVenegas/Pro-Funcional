import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { MembershipPlan, Role } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'Camila Gonzalez', description: 'Nombre completo' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @ApiProperty({ example: 'camila.gonzalez@gmail.com', description: 'Correo electrónico' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Contraseña de al menos 6 caracteres' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiPropertyOptional({ example: '+56 9 7654 3210', description: 'Teléfono de contacto' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: MembershipPlan, default: MembershipPlan.STANDARD, description: 'Plan seleccionado' })
  @IsOptional()
  @IsEnum(MembershipPlan)
  plan?: MembershipPlan;

  @ApiPropertyOptional({ enum: Role, default: Role.PATIENT, description: 'Rol de usuario' })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
