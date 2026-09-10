import { BadRequestException, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as webpush from 'web-push';
import { createHash } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { addDays, today } from '../common/dates';

@Injectable()
export class PushService implements OnModuleInit, OnModuleDestroy {
  constructor(private prisma: PrismaService) {}
  private timer?: ReturnType<typeof setInterval>;
  private running = false;
  private logger = new Logger(PushService.name);
  onModuleInit() {
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_SUBJECT) return;
    webpush.setVapidDetails(process.env.VAPID_SUBJECT, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
    this.timer = setInterval(() => { void this.deliver(); }, 60000);
  }
  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }
  async subscribe(userId: string, value: any) {
    let url: URL;
    try { url = new URL(value.endpoint); } catch { throw new BadRequestException('Suscripción inválida.'); }
    const allowed = ['fcm.googleapis.com', 'updates.push.services.mozilla.com', 'web.push.apple.com'];
    if (url.protocol !== 'https:' || url.port || url.username || url.password || !(allowed.includes(url.hostname) || url.hostname.endsWith('.notify.windows.com')) || typeof value.keys?.auth !== 'string' || typeof value.keys?.p256dh !== 'string' || value.keys.auth.length > 200 || value.keys.p256dh.length > 300) throw new BadRequestException('Servicio de notificaciones o claves no admitidos.');
    const subscription = { endpoint: url.href, keys: { auth: value.keys.auth, p256dh: value.keys.p256dh } };
    await this.prisma.pushDevice.upsert({ where: { endpoint: url.href }, create: { endpoint: url.href, userId, subscription }, update: { userId, subscription } });
    return { success: true };
  }
  async unsubscribe(userId: string, endpoint: string) {
    if (typeof endpoint !== 'string') throw new BadRequestException('Suscripción inválida.');
    await this.prisma.pushDevice.deleteMany({ where: { userId, endpoint } });
    return { success: true };
  }
  async deliver() {
    if (this.running) return;
    this.running = true;
    try {
      const devices = await this.prisma.pushDevice.findMany();
      for (const device of devices) {
        const user = await this.prisma.user.findUnique({ where: { id: device.userId }, include: { bookings: { where: { status: 'RESERVED', confirmedAt: null, bookingDate: { gt: new Date(), lte: new Date(Date.now() + 86400000) } } } } });
        if (!user) continue;
        const care: any = user.care || {};
        const due = (care.invoices || []).filter((i: any) => !i.paidAt && i.dueDate <= addDays(today(), 7));
        const jobs = [
          ...user.bookings.map(b => ({ key: `class:${b.id}:${b.bookingDate.toISOString()}`, body: 'Tienes una clase próxima. Abre la app para consultar tu horario y confirmar que asistirás.' })),
          ...due.map((i: any) => ({ key: `payment:${i.id}:${today()}`, body: 'Tienes un pago pendiente de revisar. Consulta el detalle en tu app.' })),
        ];
        for (const job of jobs) {
          const id = createHash('sha256').update(device.endpoint + ':' + job.key).digest('hex');
          try {
            await this.prisma.pushDelivery.create({ data: { id, endpoint: device.endpoint } });
          } catch (error) {
            if (error.code !== 'P2002') throw error;
            const lease = await this.prisma.pushDelivery.updateMany({ where: { id, sentAt: null, claimedAt: { lt: new Date(Date.now() - 300000) } }, data: { claimedAt: new Date() } });
            if (!lease.count) continue;
          }
          try {
            await webpush.sendNotification(device.subscription as any, JSON.stringify({ body: job.body, tag: id }), { TTL: 1800, timeout: 10000 });
            await this.prisma.pushDelivery.update({ where: { id }, data: { sentAt: new Date() } });
          } catch (error) {
            if (error.statusCode === 404 || error.statusCode === 410) { await this.prisma.pushDevice.deleteMany({ where: { endpoint: device.endpoint } }); break; }
            this.logger.warn('No se pudo entregar un recordatorio; se reintentará.');
          }
        }
      }
    } catch { this.logger.warn('No se pudo procesar la cola de recordatorios.'); }
    finally { this.running = false; }
  }
}
