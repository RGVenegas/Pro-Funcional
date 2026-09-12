import * as local from './gymStore';
import { apiEnabled, request, refreshServer } from './api';
import { enqueueMutation, isOnline } from './offlineQueue';

function isNetworkError(e: unknown): boolean {
  return !isOnline() || (e instanceof TypeError && (e.message.includes('fetch') || e.message.includes('offline') || e.message.includes('Failed')));
}

async function mutation(path: string, method: string, payload?: unknown, description?: string) {
  try {
    const result = await request(path, method, payload);
    await refreshServer();
    return result;
  } catch (e) {
    if (isNetworkError(e)) {
      enqueueMutation(path, method, payload, description);
      window.dispatchEvent(new Event('profuncional-network-offline'));
      return { offlineFallback: true };
    }
    throw e;
  }
}

export async function createBookingTransaction(identity: string, blockId: string, date: string) {
  if (!apiEnabled) return local.createBookingTransaction(identity, blockId, date);
  try {
    const res = await mutation('/bookings', 'POST', { scheduleBlockId: blockId, bookingDate: date }, `Reserva de hora`);
    if (res?.offlineFallback) {
      return local.createBookingTransaction(identity, blockId, date);
    }
    return { success: true, message: res.message };
  } catch (e) {
    return { success: false, message: (e as Error).message };
  }
}

export async function cancelBookingWith24hRule(id: string, identity: string) {
  if (!apiEnabled) return local.cancelBookingWith24hRule(id, identity);
  try {
    const res = await mutation(`/bookings/${id}/cancel`, 'PATCH', undefined, `Cancelación de reserva`);
    if (res?.offlineFallback) {
      return local.cancelBookingWith24hRule(id, identity);
    }
    return { success: true, isRefunded: res.isRefunded, message: res.message };
  } catch (e) {
    return { success: false, isRefunded: false, message: (e as Error).message };
  }
}

export async function rescheduleBookingTransaction(id: string, identity: string, blockId: string, date: string) {
  if (!apiEnabled) return local.rescheduleBookingTransaction(id, identity, blockId, date);
  try {
    const res = await mutation(`/bookings/${id}/reschedule`, 'PATCH', { newScheduleBlockId: blockId, newBookingDate: date }, `Reagendamiento de reserva`);
    if (res?.offlineFallback) {
      return local.rescheduleBookingTransaction(id, identity, blockId, date);
    }
    return { success: true, message: res.message };
  } catch (e) {
    return { success: false, message: (e as Error).message };
  }
}

export async function confirmBooking(id: string, identity: string) {
  if (!apiEnabled) return local.confirmBooking(id, identity);
  const res = await mutation(`/bookings/${id}/confirm`, 'PATCH', undefined, `Confirmación de asistencia`);
  if (res?.offlineFallback) {
    return local.confirmBooking(id, identity);
  }
}

export async function recordAttendance(id: string, status: 'pending' | 'attended' | 'no-show') {
  if (!apiEnabled) return local.recordAttendance(id, status);
  const statusMap = { pending: 'RESERVED', attended: 'ATTENDED', 'no-show': 'NO_SHOW' } as const;
  const res = await mutation(`/bookings/${id}/attendance`, 'PATCH', { status: statusMap[status] }, `Registro de asistencia (${status})`);
  if (res?.offlineFallback) {
    return local.recordAttendance(id, status);
  }
}

export async function addClinicalEvaluation(id: string, evaluation: Omit<local.ClinicalEvaluation, 'id'>) {
  if (!apiEnabled) return local.addClinicalEvaluation(id, evaluation);
  const { soap, date, professional, ...values } = evaluation;
  const res = await mutation(`/clinical/evaluations/${id}`, 'POST', { ...values, ...soap }, `Evaluación clínica kinésica`);
  if (res?.offlineFallback) {
    return local.addClinicalEvaluation(id, evaluation);
  }
  return res;
}

export async function updateClinicalEvaluation(id: string, evalId: string, evaluation: Partial<Omit<local.ClinicalEvaluation, 'id'>>) {
  if (!apiEnabled) return local.updateClinicalEvaluation(id, evalId, evaluation);
  const { soap, date, professional, ...values } = evaluation;
  const res = await mutation(`/clinical/evaluations/${id}/${evalId}`, 'PATCH', { ...values, ...(soap || {}) }, `Actualización ficha clínica`);
  if (res?.offlineFallback) {
    return local.updateClinicalEvaluation(id, evalId, evaluation);
  }
  return res;
}

export async function updateMember(id: string, updates: Partial<local.GymMember>) {
  if (!apiEnabled) return local.updateMember(id, updates);
  if (updates.remainingSessions !== undefined) {
    const res = await mutation(`/packages/renew/${id}`, 'POST', undefined, `Renovación de paquete`);
    if (res?.offlineFallback) {
      return local.updateMember(id, updates);
    }
  } else {
    const res = await mutation(`/members/${id}`, 'PATCH', { ...updates, ...(updates.status ? { status: updates.status.toUpperCase() } : {}) }, `Actualización datos miembro`);
    if (res?.offlineFallback) {
      return local.updateMember(id, updates);
    }
  }
  return local.getMemberById(id);
}

export async function addCentralScheduleBlock(block: Parameters<typeof local.addCentralScheduleBlock>[0]) {
  if (!apiEnabled) return local.addCentralScheduleBlock(block);
  const res = await mutation('/schedule/blocks', 'POST', { ...block, type: block.type === 'kine' ? 'KINE_BOX' : 'FUNCTIONAL' }, `Nuevo bloque horario`);
  if (res?.offlineFallback) {
    return local.addCentralScheduleBlock(block);
  }
  return res;
}

export async function deleteCentralScheduleBlock(id: string) {
  if (!apiEnabled) return local.deleteCentralScheduleBlock(id);
  try {
    const res = await mutation(`/schedule/blocks/${id}`, 'DELETE', undefined, `Eliminar bloque horario`);
    if (res?.offlineFallback) {
      return local.deleteCentralScheduleBlock(id);
    }
    return { success: true, message: res.message };
  } catch (e) {
    return { success: false, message: (e as Error).message };
  }
}

