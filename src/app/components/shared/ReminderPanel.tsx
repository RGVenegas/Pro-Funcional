import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { bookingStart, getMemberById, getUserBookings, subscribeToBookings, subscribeToMembers } from '../../data/gymStore';
import { apiEnabled, request } from '../../data/api';
import { confirmBooking } from '../../data/operations';
import { addDays, formatDate, today } from '../../data/dates';

export function ReminderPanel({ memberId }: { memberId: string }) {
  const [, update] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const tick = () => update((n) => n + 1);
    const timer = window.setInterval(tick, 30000);
    const a = subscribeToMembers(tick);
    const b = subscribeToBookings(tick);
    return () => {
      clearInterval(timer);
      a();
      b();
    };
  }, []);

  const member = getMemberById(memberId);
  if (!member) return null;

  const next = getUserBookings(member.name).filter(
    (b) => (!b.status || b.status === 'pending') && bookingStart(b) > Date.now() && bookingStart(b) - Date.now() <= 86400000
  );
  const invoices = (member.care?.invoices || []).filter((i) => !i.paidAt && i.dueDate <= addDays(today(), 7));

  const notifications = async () => {
    try {
      if (!apiEnabled) throw new Error('Los avisos con la app cerrada estarán disponibles al conectar el servidor del centro.');
      if (!('serviceWorker' in navigator) || !('PushManager' in window))
        throw new Error('Este navegador no admite notificaciones push.');
      const { publicKey } = await request('/workspace/push-key');
      if (!publicKey) throw new Error('El centro aún no ha activado el servicio de notificaciones.');
      if ((await Notification.requestPermission()) !== 'granted')
        throw new Error('Puedes habilitar los avisos desde los permisos del navegador.');
      const registration = await navigator.serviceWorker.ready;
      const raw = atob(publicKey.replace(/-/g, '+').replace(/_/g, '/'));
      const applicationServerKey = Uint8Array.from(raw, (c) => c.charCodeAt(0));
      const subscription =
        (await registration.pushManager.getSubscription()) ||
        (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey }));
      await request('/workspace/push', 'POST', subscription.toJSON());
      setFeedback('Recordatorios de clases y pagos activados en este dispositivo.');
      setTimeout(() => setFeedback(''), 4000);
    } catch (error) {
      setFeedback((error as Error).message);
      setTimeout(() => setFeedback(''), 4000);
    }
  };

  if (!next.length && !invoices.length) return null;

  return (
    <div className="bg-white/5 rounded-2xl p-4 sm:p-5 border border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#00E676]" />
          <span>Avisos Importantes</span>
        </h3>
        <span className="text-[10px] uppercase font-bold text-[#00E676] px-2 py-0.5 rounded-full bg-[#00E676]/15 border border-[#00E676]/30">
          En tiempo real
        </span>
      </div>

      {next.map((b) => {
        const diffMs = bookingStart(b) - Date.now();
        const diffMin = Math.max(0, Math.round(diffMs / 60000));
        const isNear = diffMin <= 90;

        return (
          <div
            key={b.id}
            className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
              isNear
                ? 'bg-[#25D366]/10 border-[#25D366]/40'
                : 'bg-black/30 border-white/10'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-white">{b.title || 'Sesión Kinésica / Entrenamiento'}</span>
                {isNear && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#25D366] text-black">
                    Faltan {diffMin}m
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/60 mt-0.5">
                {formatDate(b.date)} · {b.time}
              </p>
            </div>

            <button
              disabled={Boolean(b.confirmedAt)}
              onClick={async () => {
                try {
                  await confirmBooking(b.id, member.name);
                  setFeedback('¡Asistencia confirmada con éxito! Tu cupo está asegurado.');
                  setTimeout(() => setFeedback(''), 3500);
                } catch (e) {
                  setFeedback((e as Error).message);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto ${
                b.confirmedAt
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-[#00E676] text-[#021826] hover:bg-[#00E676]/90 shadow-md shadow-[#00E676]/20'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{b.confirmedAt ? 'Asistencia Confirmada' : 'Confirmar que Asistiré'}</span>
            </button>
          </div>
        );
      })}

      {invoices.map((i) => (
        <div key={i.id} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between gap-2">
          <span>{i.description} · Vencimiento: {formatDate(i.dueDate)}</span>
          <strong className="text-amber-300 font-bold">{i.amount.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</strong>
        </div>
      ))}

      {feedback && (
        <p role="status" className="text-xs text-[#00E676] font-semibold flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{feedback}</span>
        </p>
      )}

      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
        <button onClick={notifications} className="text-[#00E676] hover:underline font-semibold">
          Activar notificaciones en este equipo
        </button>
        <span className="text-[10px]">Ventana de aviso: 90 min</span>
      </div>
    </div>
  );
}
