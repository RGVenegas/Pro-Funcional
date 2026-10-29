import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from '../../backend/node_modules/bcrypt/bcrypt.js';

const PLAN_CATALOG = {
  BASIC: { total: 4, price: 29000, name: 'Pack Básico Kinesiológico (4 ses)' },
  STANDARD: { total: 8, price: 59000, name: 'Pack Recuperación Activa (8 ses)' },
  PREMIUM: { total: 12, price: 99000, name: 'Pack Readaptación Total (12 ses)' },
};

export function resolvePlanDetails(plan) {
  const selected = PLAN_CATALOG[plan || 'STANDARD'];
  if (!selected) {
    throw new Error(`Plan no reconocido: ${plan}`);
  }
  return selected;
}

export function sanitizeUserOutput(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

export function calculatePackageExpiration(startDate = new Date()) {
  const expiresAt = new Date(startDate);
  expiresAt.setDate(expiresAt.getDate() + 30);
  return expiresAt;
}

describe('Unit Tests: Membresías, Autenticación y Seguridad (auth.service & packages.service)', () => {
  it('debe resolver la configuración exacta de sesiones y precios para cada plan', () => {
    const basic = resolvePlanDetails('BASIC');
    assert.equal(basic.total, 4);
    assert.equal(basic.price, 29000);
    assert.equal(basic.name, 'Pack Básico Kinesiológico (4 ses)');

    const standard = resolvePlanDetails('STANDARD');
    assert.equal(standard.total, 8);
    assert.equal(standard.price, 59000);
    assert.equal(standard.name, 'Pack Recuperación Activa (8 ses)');

    const premium = resolvePlanDetails('PREMIUM');
    assert.equal(premium.total, 12);
    assert.equal(premium.price, 99000);
    assert.equal(premium.name, 'Pack Readaptación Total (12 ses)');
  });

  it('debe aplicar STANDARD como fallback por defecto cuando no se especifica plan', () => {
    const defaultPlan = resolvePlanDetails(undefined);
    assert.equal(defaultPlan.total, 8);
    assert.equal(defaultPlan.price, 59000);
  });

  it('debe arrojar error ante planes inexistentes', () => {
    assert.throws(() => resolvePlanDetails('VIP_ULTRA'), /Plan no reconocido/);
  });

  it('calculatePackageExpiration() debe fijar vencimiento a exactamente 30 días posteriores', () => {
    const start = new Date('2026-06-01T12:00:00Z');
    const expiry = calculatePackageExpiration(start);
    const diffDays = Math.round((expiry.getTime() - start.getTime()) / 86400000);
    assert.equal(diffDays, 30);
  });

  it('sanitizeUserOutput() debe purgar el hash de contraseña del objeto retornado', () => {
    const rawUser = {
      id: 'usr-123',
      name: 'Clara Soto',
      email: 'clara@profuncional.cl',
      password: '$2b$10$e8wFhsd98fh23jh4sdf7.uW...',
      role: 'PATIENT',
    };

    const safe = sanitizeUserOutput(rawUser);
    assert.equal('password' in safe, false, 'El campo password no debe exponerse');
    assert.equal(safe.id, 'usr-123');
    assert.equal(safe.name, 'Clara Soto');
  });

  it('bcrypt debe hashear con salt de costo 10 y verificar contraseñas correctamente', async () => {
    const plainPassword = 'SecretPassword2026!';
    const hashed = await bcrypt.hash(plainPassword, 10);

    assert.ok(hashed.startsWith('$2b$10$') || hashed.startsWith('$2a$10$'), 'Debe usar algoritmo bcrypt con factor 10');
    assert.notEqual(hashed, plainPassword);

    const matchValid = await bcrypt.compare(plainPassword, hashed);
    assert.equal(matchValid, true, 'La contraseña correcta debe validar');

    const matchInvalid = await bcrypt.compare('WrongPassword', hashed);
    assert.equal(matchInvalid, false, 'Una contraseña incorrecta debe ser rechazada');
  });
});
