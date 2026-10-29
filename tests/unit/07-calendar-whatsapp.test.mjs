import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseEventDates, getGoogleCalendarUrl } from '../../src/app/utils/calendarExport.ts';
import { getWhatsAppUrl } from '../../src/app/utils/whatsapp.ts';

describe('Unit Tests: Exportación a Calendarios y WhatsApp (calendarExport.ts & whatsapp.ts)', () => {
  it('parseEventDates() debe desglosar fecha y calcular fecha de fin según duración', () => {
    const { start, end } = parseEventDates('2026-11-20', '15:30', 45);

    assert.equal(start.getFullYear(), 2026);
    assert.equal(start.getMonth(), 10); // 0-indexed: 10 es noviembre
    assert.equal(start.getDate(), 20);
    assert.equal(start.getHours(), 15);
    assert.equal(start.getMinutes(), 30);

    const diffMinutes = (end.getTime() - start.getTime()) / (60 * 1000);
    assert.equal(diffMinutes, 45, 'La duración entre inicio y fin debe ser de 45 minutos');
  });

  it('parseEventDates() debe usar 60 minutos como duración por defecto', () => {
    const { start, end } = parseEventDates('2026-12-05', '09:00');
    const diffMinutes = (end.getTime() - start.getTime()) / (60 * 1000);
    assert.equal(diffMinutes, 60);
  });

  it('getGoogleCalendarUrl() debe generar un enlace válido con parámetros iCal requeridos', () => {
    const event = {
      title: 'Kinesiología Rodilla con Klgo. Morales',
      dateStr: '2026-11-25',
      timeStr: '11:00',
      durationMinutes: 60,
      location: 'Box Kinésico 1 — ProFuncional',
      description: 'Sesión de terapia manual y ejercicios excéntricos.',
    };

    const urlStr = getGoogleCalendarUrl(event);
    assert.ok(urlStr.startsWith('https://calendar.google.com/calendar/render?'));

    const parsedUrl = new URL(urlStr);
    assert.equal(parsedUrl.searchParams.get('action'), 'TEMPLATE');
    assert.equal(parsedUrl.searchParams.get('text'), event.title);
    assert.equal(parsedUrl.searchParams.get('location'), event.location);
    assert.equal(parsedUrl.searchParams.get('details'), event.description);

    const datesParam = parsedUrl.searchParams.get('dates');
    assert.ok(datesParam.includes('/'), 'El parámetro dates debe tener formato inicio/fin');
    assert.match(datesParam, /^\d{8}T\d{6}Z\/\d{8}T\d{6}Z$/, 'Debe cumplir formato de timestamp UTC iCal');
  });

  it('getWhatsAppUrl() debe generar enlace wa.me al número de recepción con mensaje por defecto', () => {
    const url = getWhatsAppUrl('Valeria Vega');
    assert.ok(url.startsWith('https://wa.me/56912345678?text='));
    assert.ok(url.includes('Valeria%20Vega'));
    assert.ok(url.includes('kinesiolog%C3%ADa'));
  });

  it('getWhatsAppUrl() debe respetar mensaje personalizado y realizar encoding seguro de URI', () => {
    const custom = 'Hola, necesito reagendar mi cita del jueves por motivos laborales.';
    const url = getWhatsAppUrl('Rodrigo', custom);

    assert.ok(url.includes(encodeURIComponent(custom)));
    assert.ok(!url.includes('Valeria Vega'));
  });
});

