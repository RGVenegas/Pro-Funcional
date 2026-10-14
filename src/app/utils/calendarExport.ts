/**
 * Utilidad para exportar citas de ProFuncional a calendarios nativos (Apple Calendar, Google Calendar, Outlook)
 */

export interface CalendarEventData {
  title: string;
  description?: string;
  dateStr: string; // formato 'YYYY-MM-DD'
  timeStr: string; // formato 'HH:mm'
  durationMinutes?: number;
  location?: string;
}

const formatIcsDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

export const parseEventDates = (dateStr: string, timeStr: string, durationMinutes = 60) => {
  // Parsear fecha y hora
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);

  const start = new Date(year, (month || 1) - 1, day || 1, hour || 9, minute || 0, 0);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  return { start, end };
};

export const downloadIcsEvent = (event: CalendarEventData): void => {
  const { start, end } = parseEventDates(event.dateStr, event.timeStr, event.durationMinutes ?? 60);
  const location = event.location || 'ProFuncional — Centro Kinésico y Deportivo';
  const description = event.description || 'Sesión programada en ProFuncional. Recuerda la política de cancelación con 24h de anticipación.';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ProFuncional//Gestion Kinesico Deportiva//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:profuncional-${Date.now()}@profuncional.cl`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    // Alarma 24 horas antes para recordar política de cancelación
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Recordatorio ProFuncional: Límite de 24h para reagendar sin costo tu sesión.',
    'TRIGGER:-PT24H',
    'END:VALARM',
    // Alarma 2 horas antes
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Tu sesión en ProFuncional comienza en 2 horas.',
    'TRIGGER:-PT2H',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `profuncional-cita-${event.dateStr}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const getGoogleCalendarUrl = (event: CalendarEventData): string => {
  const { start, end } = parseEventDates(event.dateStr, event.timeStr, event.durationMinutes ?? 60);
  const location = event.location || 'ProFuncional — Centro Kinésico y Deportivo';
  const description = event.description || 'Sesión programada en ProFuncional. Recuerda la política de cancelación de 24h.';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatIcsDate(start)}/${formatIcsDate(end)}`,
    details: description,
    location: location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
