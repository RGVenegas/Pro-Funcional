export const GYM_TIME_ZONE = 'America/Santiago';
export const BOOKING_NOTICE_HOURS = 24;
export const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function today(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: GYM_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = (name: string) => parts.find(p => p.type === name)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
export function weekDate(offset = 0, mondayIndex = 0, now = new Date()): string {
  const date = today(now);
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  return addDays(date, -((weekday + 6) % 7) + offset * 7 + mondayIndex);
}
export function appointmentTime(date: string, time: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return NaN;
  const wall = Date.parse(`${date}T${time}:00Z`);
  if (!Number.isFinite(wall) || new Date(wall).toISOString().slice(0, 10) !== date) return NaN;
  const formatter = new Intl.DateTimeFormat('sv-SE', { timeZone: GYM_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  let instant = wall;
  for (let i = 0; i < 4; i++) {
    const parts = formatter.formatToParts(instant);
    const p = (key: string) => parts.find(v => v.type === key)!.value;
    const represented = Date.parse(`${p('year')}-${p('month')}-${p('day')}T${p('hour')}:${p('minute')}:${p('second')}Z`);
    if (represented === wall) return instant;
    instant += wall - represented;
  }
  return NaN; // nonexistent local time during a DST transition
}
export function formatDate(date?: string): string {
  return date ? new Date(`${date.slice(0, 10)}T12:00:00Z`).toLocaleDateString('es-CL', { timeZone: GYM_TIME_ZONE }) : 'Sin registro';
}
