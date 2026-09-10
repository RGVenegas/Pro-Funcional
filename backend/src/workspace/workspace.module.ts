import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, Injectable, Module, Param, Post, UseGuards } from '@nestjs/common';
import { IsIn, IsObject } from 'class-validator';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { serial } from '../common/transaction';
import { today } from '../common/dates';
import { PushService } from './push.service';

type Actor = { id: string; role: Role; name: string };
const clinical = (u: Actor) => u.role === Role.ADMIN || u.role === Role.KINESIOLOGO;
function str(value: unknown, required = false, max = 5000) {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new BadRequestException('Texto requerido o demasiado extenso.');
  return value.trim();
}
function date(value: unknown) {
  const s = str(value, true, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || !Number.isFinite(Date.parse(s)) || new Date(s).toISOString().slice(0, 10) !== s) throw new BadRequestException('Fecha inválida.');
  return s;
}
function positive(value: unknown) { if (!Number.isSafeInteger(value) || Number(value) < 1) throw new BadRequestException('Ingresa un número entero positivo.'); return Number(value); }
class ActionDto {
  @IsIn(['preferences', 'profile', 'message', 'routine', 'approve', 'invoice', 'paid', 'note', 'create', 'redeem', 'use']) action: string;
  @IsObject() payload: Record<string, any>;
}

@Injectable()
export class WorkspaceService {
  constructor(private prisma: PrismaService) {}
  async snapshot(actor: Actor) {
    const isPatient = actor.role === Role.PATIENT;
    const [users, bookings, blocks, activities, catalog] = await Promise.all([
      this.prisma.user.findMany({ where: isPatient ? { id: actor.id } : { role: Role.PATIENT }, include: { packages: { where: { isActive: true }, orderBy: { createdAt: 'desc' }, take: 1 }, clinicalRecords: { orderBy: [{ date: 'desc' }, { createdAt: 'desc' }] } } }),
      this.prisma.booking.findMany({ include: { scheduleBlock: true, user: { select: { name: true } } }, orderBy: { bookingDate: 'desc' } }),
      this.prisma.scheduleBlock.findMany(),
      clinical(actor) ? this.prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 30 }) : Promise.resolve([]),
      this.prisma.rewardCatalog.findUnique({ where: { id: 'main' } }),
    ]);
    const data: any = catalog?.data || { rewards: [], redemptions: [] };
    return {
      members: users.map(u => {
        const pack = u.packages[0];
        let care: any = structuredClone(u.care || {});
        const notes = clinical(actor) ? care.notes || [] : [];
        delete care.notes;
        if (actor.role === Role.COACH) care = { routine: care.routine?.status === 'approved' ? care.routine : undefined };
        else if (isPatient && care.routine?.status !== 'approved') delete care.routine;
        return { id: u.id, name: u.name, email: u.email, phone: u.phone, status: u.status.toLowerCase(), balance: u.balance, plan: pack ? { BASIC: 'Basic', STANDARD: 'Standard', PREMIUM: 'Premium' }[pack.plan] : 'Basic', packName: pack?.packName || 'Sin paquete', totalSessions: pack?.totalSessions || 0, remainingSessions: pack?.remainingSessions || 0, joinDate: today(u.joinDate), nextBilling: u.nextBilling ? today(u.nextBilling) : undefined, physicalRestrictions: u.physicalRestrictions, care, notes,
          clinicalHistory: actor.role === Role.COACH ? [] : u.clinicalRecords.map(e => ({ id: e.id, date: today(e.date), professional: e.professionalName, evaPain: e.evaPain, romDegrees: e.romDegrees, jointOrArea: e.jointOrArea, physicalRestrictions: e.physicalRestrictions, soap: { subjective: e.subjective, objective: e.objective, assessment: e.assessment, plan: e.plan } })) };
      }),
      // Other patients' identities are never sent to a patient. Anonymous slot records only convey occupancy.
      bookings: bookings.map(b => {
        const own = !isPatient || b.userId === actor.id;
        return { id: own ? b.id : `occupancy-${b.id}`, memberId: own ? b.userId : undefined, userName: own ? b.user.name : '', blockId: b.scheduleBlockId, date: today(b.bookingDate), time: `${b.scheduleBlock.startTime} - ${b.scheduleBlock.endTime}`, title: b.scheduleBlock.title, instructor: b.scheduleBlock.instructor, type: b.scheduleBlock.type === 'KINE_BOX' ? 'kine' : 'functional', status: { RESERVED: 'pending', ATTENDED: 'attended', NO_SHOW: 'no-show', CANCELLED: 'cancelled' }[b.status], createdAt: b.createdAt.toISOString(), confirmedAt: own ? b.confirmedAt?.toISOString() : undefined, isRefunded: own ? b.isRefunded : undefined };
      }),
      blocks: blocks.map(b => ({ ...b, type: b.type === 'KINE_BOX' ? 'kine' : 'functional', students: [] })),
      activities: activities.map(a => ({ id: a.id, name: a.userName, action: a.action, time: a.createdAt.toLocaleString('es-CL', { timeZone: 'America/Santiago' }) })),
      rewards: data.rewards,
      redemptions: data.redemptions.filter((r: any) => clinical(actor) || r.memberId === actor.id),
    };
  }
  async care(actor: Actor, id: string, dto: ActionDto) {
    const { action, payload: p } = dto;
    if (!clinical(actor) && (actor.id !== id || !['preferences', 'message'].includes(action))) throw new ForbiddenException('No tienes acceso a esta acción.');
    return serial(this.prisma, async tx => {
      const member = await tx.user.findUnique({ where: { id }, include: { clinicalRecords: { orderBy: [{ date: 'desc' }, { createdAt: 'desc' }], take: 1 } } });
      if (!member || member.role !== Role.PATIENT) throw new BadRequestException('Alumno no encontrado.');
      const care: any = structuredClone(member.care || {});
      switch (action) {
        case 'preferences': care.likes = str(p.likes); care.dislikes = str(p.dislikes); break;
        case 'profile': care.professional = str(p.professional, true, 250); care.goals = str(p.goals); care.background = str(p.background); break;
        case 'message': care.messages = [...(care.messages || []), { id: crypto.randomUUID(), text: str(p.text, true), author: actor.name, fromStaff: clinical(actor), date: new Date().toISOString() }]; break;
        case 'note': care.notes = [{ date: today(), author: actor.name, text: str(p.text, true) }, ...(care.notes || [])]; break;
        case 'routine': {
          const evaluation = member.clinicalRecords[0];
          if (!evaluation) throw new BadRequestException('Registra una evaluación antes de preparar la rutina.');
          care.routine = { id: crypto.randomUUID(), title: str(p.title, true, 250), base: str(p.base), exercises: str(p.exercises, true), adaptations: str(p.adaptations), evaluationId: evaluation.id, restrictions: member.physicalRestrictions || '', status: 'draft' }; break;
        }
        case 'approve':
          if (!care.routine || care.routine.evaluationId !== member.clinicalRecords[0]?.id || care.routine.restrictions !== (member.physicalRestrictions || '')) throw new BadRequestException('Actualiza el borrador con la evaluación vigente.');
          care.routine = { ...care.routine, status: 'approved', approvedBy: actor.name, approvedAt: new Date().toISOString() }; break;
        case 'invoice': care.invoices = [...(care.invoices || []), { id: crypto.randomUUID(), description: str(p.description, true, 250), amount: positive(p.amount), dueDate: date(p.dueDate) }]; break;
        case 'paid': {
          const invoice = (care.invoices || []).find((i: any) => i.id === p.id);
          if (!invoice) throw new BadRequestException('Cobro no encontrado.');
          invoice.paidAt ||= new Date().toISOString(); break;
        }
        default: throw new BadRequestException('Acción no válida para la ficha.');
      }
      await tx.user.update({ where: { id }, data: { care } });
      await tx.activityLog.create({ data: { userId: id, userName: actor.name, action: `actualizó ${action} en el seguimiento de ${member.name}` } });
      return { success: true };
    });
  }
  async rewards(actor: Actor, dto: ActionDto) {
    const { action, payload: p } = dto;
    if (!clinical(actor) && action !== 'redeem') throw new ForbiddenException('Acción reservada al centro.');
    return serial(this.prisma, async tx => {
      const catalog = await tx.rewardCatalog.upsert({ where: { id: 'main' }, create: { id: 'main' }, update: {} });
      const data: any = structuredClone(catalog.data);
      if (action === 'create') {
        const expires = date(p.expires);
        if (expires < today()) throw new BadRequestException('El beneficio ya está vencido.');
        data.rewards.push({ id: crypto.randomUUID(), title: str(p.title, true, 250), shop: str(p.shop, true, 250), terms: str(p.terms, true), classes: positive(p.classes), stock: positive(p.stock), expires, active: true });
      } else if (action === 'redeem') {
        const memberId = clinical(actor) ? str(p.memberId, true) : actor.id;
        const reward = data.rewards.find((r: any) => r.id === p.rewardId && r.active);
        if (!reward || reward.stock < 1 || reward.expires < today()) throw new BadRequestException('Beneficio no disponible.');
        const count = await tx.booking.count({ where: { userId: memberId, status: 'ATTENDED' } });
        const spent = data.redemptions.filter((r: any) => r.memberId === memberId).reduce((n: number, r: any) => n + r.classes, 0);
        if (count - spent < reward.classes) throw new BadRequestException('No tienes suficientes clases asistidas disponibles.');
        reward.stock--;
        data.redemptions.push({ id: crypto.randomUUID(), rewardId: reward.id, memberId, classes: reward.classes, title: reward.title, shop: reward.shop, date: today() });
      } else if (action === 'use') {
        const redemption = data.redemptions.find((r: any) => r.id === p.id);
        if (!redemption || redemption.usedAt) throw new BadRequestException('Cupón inexistente o ya utilizado.');
        redemption.usedAt = new Date().toISOString();
      } else throw new BadRequestException('Acción de beneficios inválida.');
      await tx.rewardCatalog.update({ where: { id: 'main' }, data: { data } });
      return { success: true };
    });
  }
}

@Controller('workspace')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private service: WorkspaceService, private push: PushService) {}
  @Get() snapshot(@GetUser() actor: Actor) { return this.service.snapshot(actor); }
  @Post('care/:id') care(@GetUser() actor: Actor, @Param('id') id: string, @Body() dto: ActionDto) { return this.service.care(actor, id, dto); }
  @Post('rewards') rewards(@GetUser() actor: Actor, @Body() dto: ActionDto) { return this.service.rewards(actor, dto); }
  @Get('push-key') key() { return { publicKey: process.env.VAPID_PUBLIC_KEY || '' }; }
  @Post('push') subscribe(@GetUser('id') id: string, @Body() body: any) { return this.push.subscribe(id, body); }
  @Delete('push') unsubscribe(@GetUser('id') id: string, @Body() body: any) { return this.push.unsubscribe(id, body.endpoint); }
}
@Module({ controllers: [WorkspaceController], providers: [WorkspaceService, PushService] })
export class WorkspaceModule {}
