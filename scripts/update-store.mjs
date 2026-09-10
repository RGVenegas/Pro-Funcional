import fs from 'node:fs';
const path = 'src/app/data/gymStore.ts';
let s = fs.readFileSync(path, 'utf8');
s = `import { today, appointmentTime, BOOKING_NOTICE_HOURS, dayNames } from './dates';\nimport { apiEnabled, serverSnapshot } from './api';\nimport type { CareProfile } from './careStore';\n` + s;
s = s.replace('export interface GymMember {', 'export interface GymMember {\n  care?: CareProfile;\n  notes?: Array<{ date: string; author: string; text: string }>;');
s = s.replace('  createdAt: string;\n}', "  createdAt: string;\n  memberId?: string;\n  status?: 'pending' | 'attended' | 'no-show' | 'cancelled';\n  confirmedAt?: string;\n  isRefunded?: boolean;\n}");
s = s.replace("  status: 'attended' | 'no-show' | 'pending';", "  status: 'attended' | 'no-show' | 'pending';\n  bookingId?: string;\n  confirmedAt?: string;");
for (const [signature, key] of [['getMembers(): GymMember[]', 'members'], ['getCentralScheduleBlocks(): CentralScheduleBlock[]', 'blocks'], ['getActivities(): GymActivity[]', 'activities']]) {
  s = s.replace(`export function ${signature} {`, `export function ${signature} {\n  if (apiEnabled) return serverSnapshot.${key};`);
}
s = s.replace('export function getUserBookings(userName?: string): UserBookingRecord[] {', `export function getUserBookings(userName?: string): UserBookingRecord[] {\n  if (apiEnabled) return serverSnapshot.bookings.filter((b: UserBookingRecord) => !userName || b.userName.toLowerCase() === userName.toLowerCase());`);
s = s.replace("physicalRestrictions: evaluation.physicalRestrictions || member.physicalRestrictions,", "physicalRestrictions: evaluation.physicalRestrictions ?? member.physicalRestrictions,\n    care: member.care?.routine ? { ...member.care, routine: { ...member.care.routine, status: 'draft', approvedAt: undefined, approvedBy: undefined } } : member.care,");
s = s.replace('return list.map((m) => ({', 'return list.map((m) => ({');
s = s.replace("clinicalHistory: m.clinicalHistory || initialMembers.find((im) => im.id === m.id)?.clinicalHistory || [],", "clinicalHistory: [...(m.clinicalHistory || [])].sort((a, b) => b.date.localeCompare(a.date)),");
s = s.replace("physicalRestrictions: m.physicalRestrictions || initialMembers.find((im) => im.id === m.id)?.physicalRestrictions || 'Sin restricciones reportadas',", "physicalRestrictions: m.physicalRestrictions ?? 'Sin restricciones reportadas',");
s = s.replace('remainingSessions: member.remainingSessions || 8,', 'remainingSessions: member.remainingSessions ?? 8,');
// Booking records, rather than recurring block rosters, own dated attendance.
s = s.slice(0, s.indexOf('export function createBookingTransaction')) + `
export function bookingsForSlot(blockId: string, date: string): UserBookingRecord[] {
  return getUserBookings().filter(b => b.blockId === blockId && b.date === date && b.status !== 'cancelled');
}
export function studentsForSlot(blockId: string, date: string): EnrolledStudent[] {
  return bookingsForSlot(blockId, date).map(b => ({ id: b.memberId || getMembers().find(m => m.name === b.userName)?.id || b.userName, name: b.userName, bookingId: b.id, confirmedAt: b.confirmedAt, status: b.status === 'attended' || b.status === 'no-show' ? b.status : 'pending', restrictions: getMembers().find(m => m.id === b.memberId || m.name === b.userName)?.physicalRestrictions }));
}
export function bookingStart(b: UserBookingRecord): number { return appointmentTime(b.date, b.time.split(' - ')[0]); }
function resolveMember(identity: string) { return getMembers().find(m => m.id === identity || m.email.toLowerCase() === identity.toLowerCase() || m.name.toLowerCase() === identity.toLowerCase()); }
function owns(b: UserBookingRecord, identity: string) { const m = resolveMember(identity); return m && (b.memberId ? b.memberId === m.id : b.userName === m.name); }
function validateSlot(member: GymMember, blockId: string, date: string, exceptId?: string): string | undefined {
  const block = getCentralScheduleBlocks().find(b => b.id === blockId && b.isActive);
  if (!block) return 'El horario no está disponible.';
  if (member.status !== 'active') return 'Tu membresía no está activa. Contacta al centro.';
  const start = appointmentTime(date, block.startTime);
  if (!Number.isFinite(start) || start <= Date.now()) return 'Selecciona una fecha y hora futuras válidas.';
  if (dayNames[new Date(date + 'T12:00:00Z').getUTCDay()] !== block.dayOfWeek) return 'La fecha no corresponde al día de este horario.';
  const reservations = getUserBookings().filter(b => b.id !== exceptId && b.status !== 'cancelled');
  if (reservations.filter(b => b.blockId === blockId && b.date === date).length >= block.capacity) return 'Cupos agotados en esta fecha.';
  const end = appointmentTime(date, block.endTime);
  if (reservations.some(b => owns(b, member.id) && b.date === date && bookingStart(b) < end && appointmentTime(b.date, b.time.split(' - ')[1]) > start)) return 'Ya tienes una reserva que coincide con este horario.';
}
export function createBookingTransaction(identity: string, blockId: string, date: string) {
  const member = resolveMember(identity);
  if (!member) return { success: false, message: 'Alumno no encontrado.' };
  const error = validateSlot(member, blockId, date);
  if (error) return { success: false, message: error };
  if ((member.remainingSessions ?? 0) < 1) return { success: false, message: 'No tienes sesiones disponibles.' };
  const block = getCentralScheduleBlocks().find(b => b.id === blockId)!;
  const booking: UserBookingRecord = { id: crypto.randomUUID(), memberId: member.id, userName: member.name, blockId, date, time: block.startTime + ' - ' + block.endTime, title: block.title, instructor: block.instructor, type: block.type, createdAt: new Date().toISOString(), status: 'pending' };
  saveUserBookings([booking, ...getUserBookings()]);
  consumeSession(member.id);
  window.dispatchEvent(new Event(scheduleChangeEvent));
  return { success: true, message: 'Sesión reservada. Se descontó una sesión de tu saldo.', booking };
}
export function cancelBookingWith24hRule(id: string, identity: string) {
  const all = getUserBookings();
  const booking = all.find(b => b.id === id);
  if (!booking || !owns(booking, identity) || (booking.status && booking.status !== 'pending') || bookingStart(booking) <= Date.now()) return { success: false, isRefunded: false, message: 'Solo puedes cancelar una reserva propia, pendiente y futura.' };
  const isRefunded = bookingStart(booking) - Date.now() >= BOOKING_NOTICE_HOURS * 3600000;
  saveUserBookings(all.map(b => b.id === id ? { ...b, status: 'cancelled', isRefunded } : b));
  if (isRefunded) refundSession(resolveMember(identity)!.id);
  const notification = { id: crypto.randomUUID(), member: booking.userName, className: booking.title, time: booking.time, instructor: booking.instructor, isRefunded, createdAt: new Date().toISOString() };
  let notifications = [];
  try { notifications = JSON.parse(localStorage.getItem('profuncional-notifications') || '[]'); } catch {}
  localStorage.setItem('profuncional-notifications', JSON.stringify([notification, ...notifications]));
  window.dispatchEvent(new CustomEvent('profuncional-booking-cancelled', { detail: notification }));
  window.dispatchEvent(new Event(scheduleChangeEvent));
  return { success: true, isRefunded, message: isRefunded ? 'Cupo liberado y una sesión devuelta a tu saldo.' : 'Cupo liberado. Al faltar menos de 24 horas, la sesión no se devuelve.' };
}
export function rescheduleBookingTransaction(id: string, identity: string, blockId: string, date: string) {
  const all = getUserBookings();
  const old = all.find(b => b.id === id);
  if (!old || !owns(old, identity) || (old.status && old.status !== 'pending')) return { success: false, message: 'Reserva no disponible.' };
  if (bookingStart(old) - Date.now() < BOOKING_NOTICE_HOURS * 3600000) return { success: false, message: 'Para reagendar deben faltar al menos 24 horas. Contacta a tu profesional.' };
  const error = validateSlot(resolveMember(identity)!, blockId, date, id);
  if (error) return { success: false, message: error };
  const block = getCentralScheduleBlocks().find(b => b.id === blockId)!;
  saveUserBookings(all.map(b => b.id === id ? { ...b, blockId, date, time: block.startTime + ' - ' + block.endTime, title: block.title, instructor: block.instructor, type: block.type, confirmedAt: undefined } : b));
  window.dispatchEvent(new Event(scheduleChangeEvent));
  return { success: true, message: 'Reserva reagendada sin alterar tu saldo.' };
}
export function confirmBooking(id: string, identity: string) {
  const all = getUserBookings();
  const b = all.find(b => b.id === id);
  if (!b || !owns(b, identity) || (b.status && b.status !== 'pending') || bookingStart(b) <= Date.now()) throw new Error('Reserva no disponible para confirmar.');
  saveUserBookings(all.map(b => b.id === id ? { ...b, confirmedAt: b.confirmedAt || new Date().toISOString() } : b));
  window.dispatchEvent(new Event(scheduleChangeEvent));
}
export function recordAttendance(id: string, status: 'pending' | 'attended' | 'no-show') {
  const all = getUserBookings();
  const b = all.find(b => b.id === id);
  if (!b || b.status === 'cancelled' || bookingStart(b) > Date.now()) throw new Error('La clase debe haber comenzado para registrar asistencia.');
  saveUserBookings(all.map(b => b.id === id ? { ...b, status } : b));
  window.dispatchEvent(new Event(scheduleChangeEvent));
}
`;
fs.writeFileSync(path, s);
