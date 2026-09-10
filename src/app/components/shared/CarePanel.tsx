import React, { useEffect, useState } from 'react';
import { getMemberById, subscribeToMembers } from '../../data/gymStore';
import { careAction, getRewards, rewardAction, rewardBalance } from '../../data/careStore';
import { formatDate, today } from '../../data/dates';

const card = 'bg-white/5 rounded-xl p-5 border border-white/10 space-y-3';
const input = 'w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm';
const button = 'px-4 py-2 bg-[#00B4D8] text-[#021826] rounded-lg font-bold text-sm disabled:opacity-50';
export function CarePanel({ memberId, section, staff = false, author = 'Alumno' }: { memberId: string; section: 'profile' | 'routine' | 'messages' | 'payments' | 'rewards'; staff?: boolean; author?: string }) {
  const [, render] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => subscribeToMembers(() => render(n => n + 1)), []);
  const member = getMemberById(memberId);
  if (!member) return null;
  const care = member.care || {};
  const run = async (task: () => Promise<unknown>, message: string) => {
    if (busy) return;
    setBusy(true);
    try { await task(); setFeedback(message); render(n => n + 1); } catch (e) { setFeedback((e as Error).message); } finally { setBusy(false); }
  };
  const submit = (action: Parameters<typeof careAction>[1], message = 'Guardado correctamente.') => (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const values: any = Object.fromEntries(new FormData(form));
    if (action === 'invoice') values.amount = Number(values.amount);
    void run(async () => { await careAction(memberId, action, values, staff, author); if (action === 'message' || action === 'invoice') form.reset(); }, message);
  };
  const field = (label: string, name: string, value = '', multiline = false) => <label className="block text-sm text-white/70">{label}{multiline ? <textarea name={name} defaultValue={value} maxLength={5000} rows={3} className={input} /> : <input name={name} defaultValue={value} maxLength={250} className={input} />}</label>;
  const routine = care.routine;
  const rewardData = getRewards();
  return <div className={card}>
    {feedback && <p role="status" className="text-sm text-[#00B4D8]">{feedback}</p>}
    {section === 'profile' && <>
      <h3 className="font-bold">Mi acompañamiento</h3>
      <p className="text-sm text-white/60">Profesional responsable: {care.professional || 'Pendiente de asignación'}</p>
      {staff && <form onSubmit={submit('profile')} className="space-y-3">
        {field('Profesional responsable', 'professional', care.professional)}
        {field('Objetivos del alumno', 'goals', care.goals, true)}
        {field('Antecedentes relevantes registrados por el especialista', 'background', care.background, true)}
        <button disabled={busy} className={button}>Guardar ficha</button>
      </form>}
      {!staff && care.goals && <p className="text-sm whitespace-pre-wrap">Objetivos: {care.goals}</p>}
      <form onSubmit={submit('preferences')} className="space-y-3">
        {field('Actividades que me gustan', 'likes', care.likes, true)}
        {field('Actividades que no me gustan o prefiero evitar', 'dislikes', care.dislikes, true)}
        <p className="text-xs text-white/50">Tus preferencias ayudan a preparar las clases. Las restricciones físicas se registran en la evaluación del especialista.</p>
        <button disabled={busy} className={button}>Guardar preferencias</button>
      </form>
    </>}
    {section === 'routine' && <>
      <h3 className="font-bold">Rutina personalizada</h3>
      {routine && (staff || routine.status === 'approved') ? <div className="space-y-2 text-sm">
        <p className="font-semibold">{routine.title} · {routine.status === 'approved' ? 'Aprobada' : 'Pendiente de revisión'}</p>
        <p className="whitespace-pre-wrap">{routine.exercises}</p>
        <p className="text-white/60 whitespace-pre-wrap">{routine.adaptations}</p>
        {routine.approvedBy && <p className="text-xs text-white/50">Revisada por {routine.approvedBy} · {formatDate(routine.approvedAt)}</p>}
      </div> : <p className="text-sm text-white/60">Tu profesional está preparando la pauta para tu evaluación actual.</p>}
      {staff && <form key={routine?.id || 'new'} onSubmit={submit('routine', 'Borrador guardado. Revisa la pauta antes de aprobarla.')} className="space-y-3">
        {field('Nombre de la rutina', 'title', routine?.title)}
        {field('Rutina base del profesor', 'base', routine?.base, true)}
        {field('Ejercicios y dosificación indicados por el profesional', 'exercises', routine?.exercises, true)}
        {field('Adaptaciones y alternativas autorizadas para este alumno', 'adaptations', routine?.adaptations, true)}
        <p className="text-xs text-white/60">Restricciones vigentes: {member.physicalRestrictions || 'Sin registro'}</p>
        <button disabled={busy} className={button}>Guardar borrador</button>
        {routine?.status === 'draft' && <button disabled={busy} type="button" onClick={() => run(() => careAction(memberId, 'approve', {}, true, author), 'Rutina aprobada y disponible para el alumno.')} className={button + ' ml-2'}>Aprobar y asignar</button>}
      </form>}
    </>}
    {section === 'messages' && <>
      <h3 className="font-bold">Seguimiento con tu profesional</h3>
      <p className="text-sm text-white/60">Cuéntanos cómo te sentiste en tu clase o qué te gustaría ajustar.</p>
      <div className="space-y-3 max-h-72 overflow-y-auto">
        {(care.messages || []).map(m => <div key={m.id} className="bg-white/5 rounded-lg p-3 text-sm"><p className="text-xs text-white/50">{m.author} · {formatDate(m.date)}</p><p className="whitespace-pre-wrap">{m.text}</p></div>)}
        {!care.messages?.length && <p className="text-sm text-white/50">Todavía no hay mensajes.</p>}
      </div>
      <form onSubmit={submit('message', 'Mensaje guardado para el seguimiento.')} className="space-y-3">
        <textarea aria-label="Mensaje de seguimiento" required name="text" rows={3} maxLength={5000} className={input} />
        <button disabled={busy} className={button}>{staff ? 'Responder al alumno' : 'Enviar a mi profesional'}</button>
      </form>
    </>}
    {section === 'payments' && <>
      <h3 className="font-bold">Pagos y vencimientos</h3>
      {(care.invoices || []).map(i => <div key={i.id} className="flex flex-wrap justify-between gap-2 border-b border-white/10 py-2 text-sm"><div><p>{i.description} · {i.amount.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</p><p className="text-white/60">Vence {formatDate(i.dueDate)} · {i.paidAt ? 'Pagado' : i.dueDate < today() ? 'Vencido' : 'Pendiente'}</p></div>{staff && !i.paidAt && <button disabled={busy} className={button} onClick={() => run(() => careAction(memberId, 'paid', { id: i.id }, true, author), 'Pago registrado. Se detuvieron sus recordatorios.')}>Registrar pago</button>}</div>)}
      {!care.invoices?.length && <p className="text-sm text-white/60">No hay cobros registrados.</p>}
      {staff && <form onSubmit={submit('invoice')} className="space-y-3">
        {field('Concepto', 'description')}
        <label className="block text-sm">Monto (CLP)<input required name="amount" type="number" min="1" step="1" className={input} /></label>
        <label className="block text-sm">Vencimiento<input required name="dueDate" type="date" defaultValue={today()} className={input} /></label>
        <button disabled={busy} className={button}>Registrar cobro</button>
      </form>}
    </>}
    {section === 'rewards' && <>
      <h3 className="font-bold">Beneficios por tu constancia</h3>
      <p className="text-sm text-white/60">{Math.max(0, rewardBalance(memberId))} clases asistidas disponibles para canjear.</p>
      {rewardData.rewards.filter(r => r.active && r.expires >= today()).map(r => <div key={r.id} className="space-y-2 border-b border-white/10 py-2 text-sm"><p className="font-semibold">{r.title} · {r.shop}</p><p>{r.classes} clases · {r.stock} disponibles · Hasta {formatDate(r.expires)}</p><p className="text-white/60">{r.terms}</p><button disabled={busy || r.stock < 1 || rewardBalance(memberId) < r.classes} className={button} onClick={() => run(() => rewardAction('redeem', { memberId, rewardId: r.id }), 'Beneficio canjeado. Presenta tu código al centro para validarlo.')}>Canjear</button></div>)}
      {!rewardData.rewards.length && <p className="text-sm text-white/60">El centro aún no ha publicado beneficios de comercios asociados.</p>}
      {rewardData.redemptions.filter(r => r.memberId === memberId).map(r => <div key={r.id} className="text-sm break-all"><p>{r.title} · {r.shop} · {r.usedAt ? 'Utilizado' : 'Disponible'}</p><p className="text-xs text-white/60">Código: {r.id}</p>{staff && !r.usedAt && <button disabled={busy} className={button} onClick={() => run(() => rewardAction('use', { id: r.id }), 'Canje validado.')}>Marcar utilizado</button>}</div>)}
    </>}
  </div>;
}

export function RewardManagement() {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  return <div className={card}><h3 className="font-bold">Convenios y premios</h3><form className="space-y-3" onSubmit={async e => {
    e.preventDefault(); if (busy) return; setBusy(true); const form = e.currentTarget; const p: any = Object.fromEntries(new FormData(form)); p.classes = Number(p.classes); p.stock = Number(p.stock);
    try { await rewardAction('create', p); setMessage('Beneficio publicado para los alumnos.'); form.reset(); } catch (error) { setMessage((error as Error).message); } finally { setBusy(false); }
  }}>
    {['title', 'shop', 'terms'].map((name, i) => <label key={name} className="block text-sm">{['Beneficio', 'Comercio asociado', 'Condiciones de canje'][i]}<input required name={name} maxLength={500} className={input} /></label>)}
    <label className="block text-sm">Clases por premio<input required name="classes" type="number" min="1" step="1" className={input} /></label>
    <label className="block text-sm">Cantidad disponible<input required name="stock" type="number" min="1" step="1" className={input} /></label>
    <label className="block text-sm">Válido hasta<input required name="expires" type="date" min={today()} className={input} /></label>
    <button disabled={busy} className={button}>Publicar beneficio</button><p role="status" className="text-sm text-[#00B4D8]">{message}</p>
  </form></div>;
}
