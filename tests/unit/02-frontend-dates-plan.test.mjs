import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getMinutesUntilClass,
  isWithinConfirmationWindow,
  calculatePlanCycle,
  CONFIRMATION_WINDOW_MINUTES,
  appointmentTime,
} from '../../src/app/data/dates.ts';

describe('Unit Tests: Frontend Dates & Membership Plan Cycle (dates.ts)', () => {
  it('getMinutesUntilClass() debe calcular minutos restantes para formatos HH:mm y rangos HH:mm - HH:mm', () => {
    // Simulamos una clase exactamente dentro de 60 minutos
    const now = new Date();
    const futureDate = new Date(now.getTime() + 60 * 60 * 1000);
    const dateStr = futureDate.toISOString().slice(0, 10);
    const hours = String(futureDate.getHours()).padStart(2, '0');
    const minutes = String(futureDate.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    const diff = getMinutesUntilClass(dateStr, timeStr);
    assert.ok(Math.abs(diff - 60) <= 2, `Se esperaban ~60 minutos, resultado: ${diff}`);

    // Probar rango de horas tipo '18:00 - 19:00'
    const rangeDiff = getMinutesUntilClass(dateStr, `${timeStr} - 23:59`);
    assert.equal(rangeDiff, diff, 'Debe extraer el inicio del rango correctamente');
  });

  it('getMinutesUntilClass() debe retornar NaN si la fecha u hora son inválidas', () => {
    assert.ok(Number.isNaN(getMinutesUntilClass('invalid', '10:00')));
    assert.ok(Number.isNaN(getMinutesUntilClass('2026-10-30', '99:99')));
  });

  it('isWithinConfirmationWindow() debe validar la ventana de asistencia (-30min hasta +90min)', () => {
    // Si la clase es en 45 minutos (dentro de la ventana de 90 min)
    const in45m = new Date(Date.now() + 45 * 60 * 1000);
    const d45 = in45m.toISOString().slice(0, 10);
    const t45 = `${String(in45m.getHours()).padStart(2, '0')}:${String(in45m.getMinutes()).padStart(2, '0')}`;
    assert.equal(isWithinConfirmationWindow(d45, t45), true, '45 min antes debe estar dentro de la ventana de confirmación');

    // Si la clase es en 180 minutos (más de 90 min antes)
    const in180m = new Date(Date.now() + 180 * 60 * 1000);
    const d180 = in180m.toISOString().slice(0, 10);
    const t180 = `${String(in180m.getHours()).padStart(2, '0')}:${String(in180m.getMinutes()).padStart(2, '0')}`;
    assert.equal(isWithinConfirmationWindow(d180, t180), false, '180 min antes debe estar fuera de la ventana');

    // Si la clase ya comenzó hace 60 minutos (fuera de la tolerancia de 30 min)
    const past60m = new Date(Date.now() - 60 * 60 * 1000);
    const dpast = past60m.toISOString().slice(0, 10);
    const tpast = `${String(past60m.getHours()).padStart(2, '0')}:${String(past60m.getMinutes()).padStart(2, '0')}`;
    assert.equal(isWithinConfirmationWindow(dpast, tpast), false, '60 min después de iniciada debe estar cerrada la ventana');
  });

  it('calculatePlanCycle() debe calcular ciclo de 30 días y periodo de gracia de 5 días', () => {
    // Plan iniciado hace 10 días (vigente)
    const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10);
    const cycle = calculatePlanCycle(tenDaysAgo);

    assert.equal(cycle.isExpired, false, 'No debe estar vencido');
    assert.equal(cycle.isInGracePeriod, false, 'No debe estar en periodo de gracia');
    assert.ok(cycle.daysRemaining >= 19 && cycle.daysRemaining <= 21, `Días restantes esperados ~20, obtenido: ${cycle.daysRemaining}`);
    assert.equal(cycle.daysOverdue, 0, 'No tiene días de retraso');

    // Verificar que renewalDate sea 30 días después del inicio
    const startMs = Date.parse(`${cycle.currentCycleStart}T12:00:00Z`);
    const renewalMs = Date.parse(`${cycle.renewalDate}T12:00:00Z`);
    const diffDays = Math.round((renewalMs - startMs) / 86400000);
    assert.equal(diffDays, 30, 'El ciclo debe durar exactamente 30 días');

    // Verificar que gracePeriodEndDate sea exactamente 5 días después de renewalDate
    const graceMs = Date.parse(`${cycle.gracePeriodEndDate}T12:00:00Z`);
    const graceDiff = Math.round((graceMs - renewalMs) / 86400000);
    assert.equal(graceDiff, 5, 'El periodo de gracia debe durar exactamente 5 días adicionales');
  });

  it('calculatePlanCycle() debe detectar periodo de gracia cuando venció hace menos de 5 días', () => {
    // Cuando el usuario tiene una fecha de renovación personalizada hace 2 días (dentro de los 5 días de gracia)
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
    const joinDate = new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10);
    const cycle = calculatePlanCycle(joinDate, twoDaysAgo);

    assert.equal(cycle.isExpired, true, 'Debe marcarse como vencido');
    assert.equal(cycle.isInGracePeriod, true, 'Debe estar en periodo de gracia activo');
    assert.equal(cycle.daysRemaining, 0, 'No quedan días regulares');
    assert.ok(cycle.daysOverdue >= 1 && cycle.daysOverdue <= 3, 'Debe indicar días de mora');
  });

  it('calculatePlanCycle() debe detectar plan vencido fuera del periodo de gracia (> 5 días)', () => {
    // Renovación hace 8 días (gracia expirada)
    const eightDaysAgo = new Date(Date.now() - 8 * 86400000).toISOString().slice(0, 10);
    const joinDate = new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10);
    const cycle = calculatePlanCycle(joinDate, eightDaysAgo);

    assert.equal(cycle.isExpired, true, 'Debe marcarse como vencido');
    assert.equal(cycle.isInGracePeriod, false, 'El periodo de gracia ya expiró');
    assert.ok(cycle.daysOverdue >= 7 && cycle.daysOverdue <= 9, 'Días de mora acumulados');
  });

  it('calculatePlanCycle() debe respetar fecha de cobro personalizada futura (customBillingStr)', () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const futureBilling = new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10);

    const cycle = calculatePlanCycle(todayStr, futureBilling);
    assert.equal(cycle.renewalDate, futureBilling, 'Debe adoptar la fecha de facturación custom');
    assert.equal(cycle.isExpired, false);
    assert.ok(cycle.daysRemaining >= 44 && cycle.daysRemaining <= 46);
  });
});
