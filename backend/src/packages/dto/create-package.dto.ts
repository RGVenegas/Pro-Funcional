import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { MembershipPlan } from '@prisma/client';

export class CreatePackageDto {
  @ApiProperty({ enum: MembershipPlan, example: MembershipPlan.STANDARD })
  @IsEnum(MembershipPlan)
  plan: MembershipPlan;

  @ApiProperty({ example: 'Pack Recuperación Activa (8 ses)' })
  @IsString()
  @IsNotEmpty()
  packName: string;

  @ApiProperty({ example: 8 })
  @IsInt()
  @Min(1)
  totalSessions: number;

  @ApiProperty({ example: 59000 })
  @IsNumber()
  price: number;
}
