export const GYM_TIME_ZONE = 'America/Santiago';
export const BOOKING_NOTICE_HOURS = 3;
export const CONFIRMATION_WINDOW_MINUTES = 90;
export const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function today(now = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: GYM_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
    const part = (name: string) => parts.find(p => p.type === name)?.value || '';
    const y = part('year') || String(now.getFullYear());
    const m = part('month') || String(now.getMonth() + 1).padStart(2, '0');
    const d = part('day') || String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  } catch {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}

export function addDays(date: string, days: number): string {
  try {
    const d = new Date(`${date}T12:00:00Z`);
    if (isNaN(d.getTime())) return today();
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  } catch {
    return today();
  }
}

export function weekDate(offset = 0, mondayIndex = 0, now = new Date()): string {
  try {
    const date = today(now);
    const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
    return addDays(date, -((weekday + 6) % 7) + offset * 7 + mondayIndex);
  } catch {
    return today();
  }
}

export function appointmentTime(date: string, time: string): number {
  if (!date || !time || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return NaN;
  try {
    const wall = Date.parse(`${date}T${time}:00Z`);
    if (!Number.isFinite(wall) || new Date(wall).toISOString().slice(0, 10) !== date) return NaN;
    const formatter = new Intl.DateTimeFormat('sv-SE', { timeZone: GYM_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
    let instant = wall;
    for (let i = 0; i < 4; i++) {
      const parts = formatter.formatToParts(instant);
      const p = (key: string) => parts.find(v => v.type === key)?.value || '00';
      const represented = Date.parse(`${p('year')}-${p('month')}-${p('day')}T${p('hour')}:${p('minute')}:${p('second')}Z`);
      if (represented === wall) return instant;
      instant += wall - represented;
    }
    return wall;
  } catch {
    return NaN;
  }
}

export function formatDate(date?: string): string {
  if (!date) return 'Sin registro';
  try {
    return new Date(`${date.slice(0, 10)}T12:00:00Z`).toLocaleDateString('es-CL', { timeZone: GYM_TIME_ZONE });
  } catch {
    return date;
  }
}

/**
 * Retorna los minutos restantes hasta el inicio de la clase.
 * Negativo si la clase ya comenzó.
 */
export function getMinutesUntilClass(date: string, time: string): number {
  const startTime = time.includes(' - ') ? time.split(' - ')[0] : time;
  const startMs = appointmentTime(date, startTime);
  if (!Number.isFinite(startMs)) return NaN;
  return Math.round((startMs - Date.now()) / 60000);
}

/**
 * Valida si la reserva se encuentra dentro de la ventana de confirmación (90 minutos antes).
 */
export function isWithinConfirmationWindow(date: string, time: string): boolean {
  const diffMinutes = getMinutesUntilClass(date, time);
  if (!Number.isFinite(diffMinutes)) return false;
  // Ventana: desde 90 min antes hasta 30 min después de iniciada la clase
  return diffMinutes <= CONFIRMATION_WINDOW_MINUTES && diffMinutes >= -30;
}

export interface PlanCycleInfo {
  joinDate: string;           // Fecha de inscripción original
  currentCycleStart: string;  // Inicio del ciclo vigente
  renewalDate: string;        // Fecha de vencimiento (30 días)
  gracePeriodEndDate: string; // Vencimiento + 5 días para pago
  isExpired: boolean;
  isInGracePeriod: boolean;
  daysRemaining: number;
  daysOverdue: number;
}

/**
 * Calcula el ciclo de 30 días desde la inscripción original, más 5 días de gracia para pago.
 */
export function calculatePlanCycle(joinDateStr?: string, customBillingStr?: string): PlanCycleInfo {
  const baseIso = joinDateStr || '2025-01-01';
  let joinTime = Date.parse(`${baseIso.slice(0, 10)}T12:00:00Z`);
  if (isNaN(joinTime)) joinTime = Date.now();

  const now = Date.now();
  const dayMs = 86400000;
  const cycleMs = 30 * dayMs;

  let cycleStart = joinTime;
  while (cycleStart + cycleMs <= now) {
    cycleStart += cycleMs;
  }

  // Si se proporcionó una fecha explícita futura, la respetamos
  let renewalTime = cycleStart + cycleMs;
  if (customBillingStr) {
    const customTime = Date.parse(`${customBillingStr.slice(0, 10)}T12:00:00Z`);
    if (!isNaN(customTime) && customTime > cycleStart) {
      renewalTime = customTime;
    }
  }

  const gracePeriodEndTime = renewalTime + (5 * dayMs);

  const isExpired = now > renewalTime;
  const isInGracePeriod = now > renewalTime && now <= gracePeriodEndTime;
  const daysRemaining = Math.max(0, Math.ceil((renewalTime - now) / dayMs));
  const daysOverdue = now > renewalTime ? Math.floor((now - renewalTime) / dayMs) : 0;

  return {
    joinDate: new Date(joinTime).toISOString().slice(0, 10),
    currentCycleStart: new Date(cycleStart).toISOString().slice(0, 10),
    renewalDate: new Date(renewalTime).toISOString().slice(0, 10),
    gracePeriodEndDate: new Date(gracePeriodEndTime).toISOString().slice(0, 10),
    isExpired,
    isInGracePeriod,
    daysRemaining,
    daysOverdue,
  };
}

