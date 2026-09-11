import * as local from './gymStore';
import { apiEnabled, request, refreshServer } from './api';

async function mutation(path: string, method: string, payload?: unknown) {
  const result = await request(path, method, payload);
  await refreshServer();
  return result;
}
export async function createBookingTransaction(identity: string, blockId: string, date: string) {
  if (!apiEnabled) return local.createBookingTransaction(identity, blockId, date);
  try { const r = await mutation('/bookings', 'POST', { scheduleBlockId: blockId, bookingDate: date }); return { success: true, message: r.message }; } catch (e) { return { success: false, message: (e as Error).message }; }
}
export async function cancelBookingWith24hRule(id: string, identity: string) {
  if (!apiEnabled) return local.cancelBookingWith24hRule(id, identity);
  try { const r = await mutation(`/bookings/${id}/cancel`, 'PATCH'); return { success: true, isRefunded: r.isRefunded, message: r.message }; } catch (e) { return { success: false, isRefunded: false, message: (e as Error).message }; }
}
export async function rescheduleBookingTransaction(id: string, identity: string, blockId: string, date: string) {
  if (!apiEnabled) return local.rescheduleBookingTransaction(id, identity, blockId, date);
  try { const r = await mutation(`/bookings/${id}/reschedule`, 'PATCH', { newScheduleBlockId: blockId, newBookingDate: date }); return { success: true, message: r.message }; } catch (e) { return { success: false, message: (e as Error).message }; }
}
export async function confirmBooking(id: string, identity: string) {
  if (!apiEnabled) return local.confirmBooking(id, identity);
  await mutation(`/bookings/${id}/confirm`, 'PATCH');
}
export async function recordAttendance(id: string, status: 'pending' | 'attended' | 'no-show') {
  if (!apiEnabled) return local.recordAttendance(id, status);
  await mutation(`/bookings/${id}/attendance`, 'PATCH', { status: { pending: 'RESERVED', attended: 'ATTENDED', 'no-show': 'NO_SHOW' }[status] });
}
export async function addClinicalEvaluation(id: string, evaluation: Omit<local.ClinicalEvaluation, 'id'>) {
  if (!apiEnabled) return local.addClinicalEvaluation(id, evaluation);
  const { soap, date, professional, ...values } = evaluation;
  return mutation(`/clinical/evaluations/${id}`, 'POST', { ...values, ...soap });
}
export async function updateClinicalEvaluation(id: string, evalId: string, evaluation: Partial<Omit<local.ClinicalEvaluation, 'id'>>) {
  if (!apiEnabled) return local.updateClinicalEvaluation(id, evalId, evaluation);
  const { soap, date, professional, ...values } = evaluation;
  return mutation(`/clinical/evaluations/${id}/${evalId}`, 'PATCH', { ...values, ...(soap || {}) });
}
export async function updateMember(id: string, updates: Partial<local.GymMember>) {
  if (!apiEnabled) return local.updateMember(id, updates);
  if (updates.remainingSessions !== undefined) await mutation(`/packages/renew/${id}`, 'POST');
  else await mutation(`/members/${id}`, 'PATCH', { ...updates, ...(updates.status ? { status: updates.status.toUpperCase() } : {}) });
  return local.getMemberById(id);
}
export async function addCentralScheduleBlock(block: Parameters<typeof local.addCentralScheduleBlock>[0]) {
  if (!apiEnabled) return local.addCentralScheduleBlock(block);
  return mutation('/schedule/blocks', 'POST', { ...block, type: block.type === 'kine' ? 'KINE_BOX' : 'FUNCTIONAL' });
}
export async function deleteCentralScheduleBlock(id: string) {
  if (!apiEnabled) return local.deleteCentralScheduleBlock(id);
  try { const r = await mutation(`/schedule/blocks/${id}`, 'DELETE'); return { success: true, message: r.message }; } catch (e) { return { success: false, message: (e as Error).message }; }
}
