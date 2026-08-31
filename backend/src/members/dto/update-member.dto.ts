import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { MemberStatus, Role } from '@prisma/client';

export class UpdateMemberDto {
  @ApiPropertyOptional({ example: 'Juan Perez' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '+56 9 8765 4321' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: MemberStatus })
  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  balance?: number;

  @ApiPropertyOptional({ example: 'Evitar impacto alto en salto / Cuidado en aterrizaje' })
  @IsOptional()
  @IsString()
  physicalRestrictions?: string;
}
