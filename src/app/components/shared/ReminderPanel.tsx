import React, { useEffect, useState } from 'react';
import { bookingStart, getMemberById, getUserBookings, subscribeToBookings, subscribeToMembers } from '../../data/gymStore';
import { apiEnabled, request } from '../../data/api';
import { confirmBooking } from '../../data/operations';
import { addDays, formatDate, today } from '../../data/dates';

export function ReminderPanel({ memberId }: { memberId: string }) {
  const [, update] = useState(0);
  const [feedback, setFeedback] = useState('');
  useEffect(() => { const tick = () => update(n => n + 1); const timer = window.setInterval(tick, 30000); const a = subscribeToMembers(tick); const b = subscribeToBookings(tick); return () => { clearInterval(timer); a(); b(); }; }, []);
  const member = getMemberById(memberId);
  if (!member) return null;
  const next = getUserBookings(member.name).filter(b => (!b.status || b.status === 'pending') && bookingStart(b) > Date.now() && bookingStart(b) - Date.now() <= 86400000);
  const invoices = (member.care?.invoices || []).filter(i => !i.paidAt && i.dueDate <= addDays(today(), 7));
  const notifications = async () => {
    try {
      if (!apiEnabled) throw new Error('Los avisos con la app cerrada estarán disponibles al conectar el servidor del centro.');
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) throw new Error('Este navegador no admite notificaciones push. Puedes consultar aquí tus recordatorios.');
      const { publicKey } = await request('/workspace/push-key');
      if (!publicKey) throw new Error('El centro aún no ha activado el servicio de notificaciones.');
      if (await Notification.requestPermission() !== 'granted') throw new Error('Puedes habilitar los avisos desde los permisos del navegador.');
      const registration = await navigator.serviceWorker.ready;
      const raw = atob(publicKey.replace(/-/g, '+').replace(/_/g, '/'));
      const applicationServerKey = Uint8Array.from(raw, c => c.charCodeAt(0));
      const subscription = await registration.pushManager.getSubscription() || await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
      await request('/workspace/push', 'POST', subscription.toJSON());
      setFeedback('Recordatorios de clases y pagos activados en este dispositivo.');
    } catch (error) { setFeedback((error as Error).message); }
  };
  return <div className="bg-white/5 rounded-xl p-5 border border-white/10 space-y-3">
    <h3 className="font-bold">Tus recordatorios</h3>
    {next.map(b => <div key={b.id} className="text-sm flex flex-wrap items-center justify-between gap-2"><p>{b.title} · {formatDate(b.date)} · {b.time}</p><button disabled={Boolean(b.confirmedAt)} className="text-[#00E676] disabled:text-white/50 font-semibold" onClick={async () => { try { await confirmBooking(b.id, member.name); setFeedback('Confirmación guardada.'); } catch (e) { setFeedback((e as Error).message); } }}>{b.confirmedAt ? 'Confirmaste que asistirás' : 'Confirmo que asistiré'}</button></div>)}
    {invoices.map(i => <p key={i.id} className="text-sm text-amber-200">{i.description} · {i.amount.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })} · Vencimiento: {formatDate(i.dueDate)}</p>)}
    {!next.length && !invoices.length && <p className="text-sm text-white/60">No tienes recordatorios pendientes.</p>}
    <button onClick={notifications} className="text-sm text-[#00E676] font-semibold">Activar avisos en este dispositivo</button>
    <button onClick={async () => { try { const registration = await navigator.serviceWorker?.getRegistration(); const sub = await registration?.pushManager.getSubscription(); if (sub) { if (apiEnabled) await request('/workspace/push', 'DELETE', { endpoint: sub.endpoint }); await sub.unsubscribe(); } setFeedback('Avisos desactivados en este dispositivo.'); } catch (e) { setFeedback((e as Error).message); } }} className="ml-3 text-sm text-white/60">Desactivar avisos</button>
    {feedback && <p role="status" className="text-sm text-[#00E676]">{feedback}</p>}
  </div>;
}
