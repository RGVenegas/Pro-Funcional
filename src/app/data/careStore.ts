import { getMemberById, getUserBookings, updateMember } from './gymStore';
import { apiEnabled, request, refreshServer, serverSnapshot } from './api';
import { today } from './dates';

export interface Routine { id: string; title: string; base: string; exercises: string; adaptations: string; evaluationId: string; restrictions: string; status: 'draft' | 'approved'; approvedBy?: string; approvedAt?: string; }
export interface CareProfile {
  professional?: string; goals?: string; background?: string; likes?: string; dislikes?: string;
  messages?: Array<{ id: string; text: string; author: string; fromStaff: boolean; date: string }>;
  routine?: Routine;
  invoices?: Array<{ id: string; description: string; amount: number; dueDate: string; paidAt?: string }>;
}
export interface Reward { id: string; title: string; shop: string; classes: number; stock: number; expires: string; terms: string; active: boolean; }
export interface Redemption { id: string; rewardId: string; memberId: string; classes: number; title: string; shop: string; date: string; usedAt?: string; }
export type CareAction = 'preferences' | 'profile' | 'message' | 'routine' | 'approve' | 'invoice' | 'paid' | 'note';
const rewardKey = 'profuncional-rewards-v1';
function readRewards(): { rewards: Reward[]; redemptions: Redemption[] } {
  if (apiEnabled) return { rewards: serverSnapshot.rewards || [], redemptions: serverSnapshot.redemptions || [] };
  try { return JSON.parse(localStorage.getItem(rewardKey) || '{"rewards":[],"redemptions":[]}'); } catch { return { rewards: [], redemptions: [] }; }
}
export function getRewards() { return readRewards(); }
export function rewardBalance(memberId: string) {
  const member = getMemberById(memberId);
  const attended = getUserBookings(member?.name).filter(b => b.status === 'attended').length;
  return attended - readRewards().redemptions.filter(r => r.memberId === memberId).reduce((sum, r) => sum + r.classes, 0);
}
export async function careAction(memberId: string, action: CareAction, payload: any, staff = false, author = 'Alumno') {
  if (apiEnabled) { await request(`/workspace/care/${memberId}`, 'POST', { action, payload }); await refreshServer(); return; }
  const member = getMemberById(memberId);
  if (!member) throw new Error('Alumno no encontrado.');
  const care: CareProfile = structuredClone(member.care || {});
  if (!staff && !['preferences', 'message'].includes(action)) throw new Error('Acción reservada al profesional.');
  if (action === 'preferences') { care.likes = String(payload.likes || '').trim(); care.dislikes = String(payload.dislikes || '').trim(); }
  if (action === 'profile') { care.professional = payload.professional.trim(); care.goals = payload.goals.trim(); care.background = payload.background.trim(); }
  if (action === 'message') {
    if (!String(payload.text || '').trim()) throw new Error('Escribe un mensaje.');
    care.messages = [...(care.messages || []), { id: crypto.randomUUID(), text: payload.text.trim(), author, fromStaff: staff, date: new Date().toISOString() }];
  }
  if (action === 'routine') {
    const evaluation = member.clinicalHistory?.[0];
    if (!evaluation) throw new Error('Registra primero una evaluación clínica.');
    if (!payload.title?.trim() || !payload.exercises?.trim()) throw new Error('Completa título y ejercicios con su dosificación.');
    care.routine = { id: crypto.randomUUID(), title: payload.title.trim(), base: payload.base || '', exercises: payload.exercises.trim(), adaptations: payload.adaptations || '', evaluationId: evaluation.id, restrictions: member.physicalRestrictions || '', status: 'draft' };
  }
  if (action === 'approve') {
    if (!care.routine || care.routine.evaluationId !== member.clinicalHistory?.[0]?.id || care.routine.restrictions !== (member.physicalRestrictions || '')) throw new Error('Actualiza el borrador con la evaluación vigente.');
    care.routine = { ...care.routine, status: 'approved', approvedBy: author, approvedAt: new Date().toISOString() };
  }
  if (action === 'invoice') {
    if (!payload.description?.trim() || !Number.isFinite(payload.amount) || payload.amount <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(payload.dueDate)) throw new Error('Ingresa descripción, monto positivo y fecha de vencimiento.');
    care.invoices = [...(care.invoices || []), { ...payload, id: crypto.randomUUID() }];
  }
  if (action === 'paid') { care.invoices = (care.invoices || []).map(i => i.id === payload.id ? { ...i, paidAt: i.paidAt || new Date().toISOString() } : i); }
  if (action === 'note') {
    if (!payload.text?.trim()) throw new Error('Escribe una nota.');
    updateMember(memberId, { notes: [{ date: today(), author, text: payload.text.trim() }, ...(member.notes || [])] });
    return;
  }
  updateMember(memberId, { care });
}
export async function rewardAction(action: 'create' | 'redeem' | 'use', payload: any) {
  if (apiEnabled) { const result = await request('/workspace/rewards', 'POST', { action, payload }); await refreshServer(); return result; }
  const state = readRewards();
  if (action === 'create') {
    if (!payload.title?.trim() || !payload.shop?.trim() || !Number.isInteger(payload.classes) || payload.classes < 1 || !Number.isInteger(payload.stock) || payload.stock < 1 || payload.expires < today() || !payload.terms?.trim()) throw new Error('Completa el beneficio, comercio, clases, stock, vigencia y condiciones.');
    state.rewards.push({ ...payload, id: crypto.randomUUID(), active: true });
  }
  if (action === 'redeem') {
    const reward = state.rewards.find(r => r.id === payload.rewardId && r.active);
    if (!reward || reward.stock < 1 || reward.expires < today()) throw new Error('Beneficio no disponible.');
    if (rewardBalance(payload.memberId) < reward.classes) throw new Error('Aún no tienes suficientes clases asistidas disponibles.');
    reward.stock--;
    state.redemptions.push({ id: crypto.randomUUID(), rewardId: reward.id, memberId: payload.memberId, classes: reward.classes, title: reward.title, shop: reward.shop, date: today() });
  }
  if (action === 'use') {
    const redemption = state.redemptions.find(r => r.id === payload.id);
    if (!redemption || redemption.usedAt) throw new Error('Cupón inexistente o ya utilizado.');
    redemption.usedAt = new Date().toISOString();
  }
  localStorage.setItem(rewardKey, JSON.stringify(state));
  window.dispatchEvent(new Event('profuncional-members-changed'));
}
