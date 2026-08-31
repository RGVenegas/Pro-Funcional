import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MembersModule } from './members/members.module';
import { ScheduleModule } from './schedule/schedule.module';
import { BookingsModule } from './bookings/bookings.module';
import { PackagesModule } from './packages/packages.module';
import { ClinicalModule } from './clinical/clinical.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    MembersModule,
    ScheduleModule,
    BookingsModule,
    PackagesModule,
    ClinicalModule,
  ],
})
export class AppModule {}
