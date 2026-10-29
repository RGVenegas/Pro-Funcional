import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  GYM_TIME_ZONE,
  BOOKING_NOTICE_HOURS,
  CONFIRMATION_WINDOW_MINUTES,
  dayNames,
  today,
  addDays,
  weekDate,
  appointmentTime,
  formatDate,
} from '../../backend/src/common/dates.ts';

describe('Unit Tests: Backend Dates & Timezone Logic (dates.ts)', () => {
  it('debe definir las constantes operacionales del centro kinésico', () => {
    assert.equal(GYM_TIME_ZONE, 'America/Santiago');
    assert.equal(BOOKING_NOTICE_HOURS, 3, 'La política de cancelación con devolución exige al menos 3 horas de anticipación');
    assert.equal(CONFIRMATION_WINDOW_MINUTES, 90, 'La ventana para confirmar asistencia debe ser de 90 minutos');
    assert.deepEqual(dayNames, [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]);
  });

  it('today() debe retornar una fecha con formato YYYY-MM-DD en zona horaria de Santiago', () => {
    const res = today();
    assert.match(res, /^\d{4}-\d{2}-\d{2}$/, 'Debe cumplir formato ISO date');

    const specificDate = new Date('2026-05-15T02:00:00Z');
    const santiagoDate = today(specificDate);
    assert.equal(santiagoDate, '2026-05-14', 'Debe reflejar el huso horario America/Santiago (UTC-4 / UTC-3)');
  });

  it('addDays() debe sumar y restar días correctamente considerando transiciones de mes y año', () => {
    assert.equal(addDays('2026-01-30', 2), '2026-02-01', 'Transición enero a febrero');
    assert.equal(addDays('2026-12-31', 1), '2027-01-01', 'Transición de año');
    assert.equal(addDays('2026-03-01', -1), '2026-02-28', 'Día previo a inicio de mes');
    assert.equal(addDays('2026-05-10', 0), '2026-05-10', 'Offset 0 debe mantener la misma fecha');
    
    // Caso de fecha inválida debe retornar fallback today()
    const fallback = addDays('invalid-date', 5);
    assert.match(fallback, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('weekDate() debe calcular el inicio de semana (lunes) y fin de semana (domingo)', () => {
    // 2026-10-28 es miércoles
    const refDate = new Date('2026-10-28T15:00:00Z');
    const monday = weekDate(0, 0, refDate);
    assert.equal(monday, '2026-10-26', 'El lunes de la semana actual debe ser 2026-10-26');

    const sunday = weekDate(0, 6, refDate);
    assert.equal(sunday, '2026-11-01', 'El domingo de la semana actual debe ser 2026-11-01');

    const nextMonday = weekDate(1, 0, refDate);
    assert.equal(nextMonday, '2026-11-02', 'El lunes de la siguiente semana');
  });

  it('appointmentTime() debe calcular el timestamp epoch exacto para hora local de Santiago', () => {
    const timestamp = appointmentTime('2026-11-10', '08:30');
    assert.ok(Number.isFinite(timestamp), 'El timestamp debe ser un número finito');
    assert.ok(timestamp > 0);

    const checkDate = new Date(timestamp);
    const formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'America/Santiago',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    assert.equal(formatter.format(checkDate), '08:30', 'El timestamp generado debe coincidir exactamente con las 08:30 en Santiago');
  });

  it('appointmentTime() debe retornar NaN ante formatos o valores inválidos', () => {
    assert.ok(Number.isNaN(appointmentTime('', '09:00')), 'Fecha vacía');
    assert.ok(Number.isNaN(appointmentTime('2026-11-10', '')), 'Hora vacía');
    assert.ok(Number.isNaN(appointmentTime('2026/11/10', '09:00')), 'Formato fecha con slash');
    assert.ok(Number.isNaN(appointmentTime('2026-11-10', '25:00')), 'Hora mayor a 23');
    assert.ok(Number.isNaN(appointmentTime('2026-11-10', '09:65')), 'Minuto mayor a 59');
    assert.ok(Number.isNaN(appointmentTime('not-a-date', 'not-a-time')), 'Strings arbitrarios');
  });

  it('formatDate() debe retornar formato es-CL y manejar casos nulos/vacíos', () => {
    assert.equal(formatDate(''), 'Sin registro', 'Entrada vacía');
    assert.equal(formatDate(undefined), 'Sin registro', 'Entrada undefined');

    const formatted = formatDate('2026-11-20');
    assert.ok(formatted.includes('20') && formatted.includes('11') && formatted.includes('2026'), 'Debe contener día, mes y año formateados en es-CL');
  });
});

