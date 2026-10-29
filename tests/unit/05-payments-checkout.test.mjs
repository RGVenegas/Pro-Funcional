import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Normalizador de payloads para Mercado Pago Orders API
 * Extraído de PaymentsService.processPayment (backend/src/payments/payments.service.ts)
 */
export function buildMercadoPagoOrderPayload(dto) {
  const isDebit =
    dto.payment_method_id?.toLowerCase().includes('deb') ||
    dto.payment_type_id === 'debit_card';

  let paymentMethodId = dto.payment_method_id;
  if (isDebit) {
    if (paymentMethodId === 'visa') paymentMethodId = 'debvisa';
    if (paymentMethodId === 'master') paymentMethodId = 'debmaster';
  }

  const paymentMethodType = isDebit ? 'debit_card' : (dto.payment_type_id || 'credit_card');
  const installmentsCount = isDebit ? 1 : (Number(dto.installments) || 1);

  const paymentMethodObj = {
    id: paymentMethodId,
    type: paymentMethodType,
    token: dto.token,
    statement_descriptor: 'PROFUNCIONAL',
  };

  // En Mercado Pago Orders API, prepaid_card prohíbe la propiedad installments
  if (paymentMethodType !== 'prepaid_card') {
    paymentMethodObj.installments = installmentsCount;
  }

  return {
    type: 'online',
    processing_mode: 'automatic',
    external_reference: dto.external_reference || `PROFUNCIONAL-${Date.now()}`,
    total_amount: String(Math.round(dto.transaction_amount)),
    items: [
      {
        title: dto.description || 'Servicio ProFuncional',
        unit_price: String(Math.round(dto.transaction_amount)),
        quantity: 1,
        category_id: 'services',
        external_code: dto.serviceId || 'PROFUNCIONAL-PACK',
      },
    ],
    payments: [
      {
        payment_method: paymentMethodObj,
        amount: String(Math.round(dto.transaction_amount)),
      },
    ],
    payer: {
      email: dto.payer?.email?.toLowerCase(),
      identification: dto.payer?.identification,
    },
  };
}

describe('Unit Tests: Pasarela Mercado Pago & Normalización de Cobros (payments.service.ts)', () => {
  it('debe mapear tarjetas de débito en Chile de visa/master a debvisa/debmaster y fijar cuotas = 1', () => {
    const debitVisaDto = {
      transaction_amount: 59000,
      payment_method_id: 'visa',
      payment_type_id: 'debit_card',
      token: 'tok_test_debit_123',
      installments: 3, // El usuario o frontend envió 3 erróneamente en débito
      description: 'Pack Recuperación Activa',
      payer: { email: 'Paciente@ProFuncional.CL' },
    };

    const payload = buildMercadoPagoOrderPayload(debitVisaDto);
    const pm = payload.payments[0].payment_method;

    assert.equal(pm.id, 'debvisa', 'Debe normalizarse a debvisa para adquirencia chilena Redcompra/Transbank');
    assert.equal(pm.type, 'debit_card');
    assert.equal(pm.installments, 1, 'Las tarjetas de débito no permiten cuotas; debe fijarse en 1');
  });

  it('debe mapear tarjeta débito Mastercard a debmaster', () => {
    const debitMasterDto = {
      transaction_amount: 29000,
      payment_method_id: 'master',
      payment_type_id: 'debit_card',
      token: 'tok_test_master_123',
      payer: { email: 'test@gym.cl' },
    };

    const payload = buildMercadoPagoOrderPayload(debitMasterDto);
    const pm = payload.payments[0].payment_method;

    assert.equal(pm.id, 'debmaster');
    assert.equal(pm.type, 'debit_card');
    assert.equal(pm.installments, 1);
  });

  it('debe omitir la clave installments en tarjetas prepago (prepaid_card) para evitar error de API', () => {
    const prepaidDto = {
      transaction_amount: 29000,
      payment_method_id: 'mach',
      payment_type_id: 'prepaid_card',
      token: 'tok_prepago_456',
      payer: { email: 'mach.user@correo.cl' },
    };

    const payload = buildMercadoPagoOrderPayload(prepaidDto);
    const pm = payload.payments[0].payment_method;

    assert.equal(pm.type, 'prepaid_card');
    assert.equal('installments' in pm, false, 'prepaid_card prohíbe la propiedad installments en Orders API');
  });

  it('debe permitir cuotas configuradas en tarjetas de crédito tradicionales', () => {
    const creditDto = {
      transaction_amount: 99000,
      payment_method_id: 'visa',
      payment_type_id: 'credit_card',
      token: 'tok_credito_789',
      installments: 6, // 6 cuotas
      payer: { email: 'socio@gmail.com' },
    };

    const payload = buildMercadoPagoOrderPayload(creditDto);
    const pm = payload.payments[0].payment_method;

    assert.equal(pm.id, 'visa');
    assert.equal(pm.type, 'credit_card');
    assert.equal(pm.installments, 6, 'Debe preservar las 6 cuotas solicitadas');
  });

  it('debe redondear montos a enteros estrictos sin decimales para moneda CLP chilena', () => {
    const floatAmountDto = {
      transaction_amount: 59000.75, // Decimal flotante indebido
      payment_method_id: 'debvisa',
      payment_type_id: 'debit_card',
      token: 'tok_123',
      payer: { email: 'user@test.cl' },
    };

    const payload = buildMercadoPagoOrderPayload(floatAmountDto);

    assert.equal(payload.total_amount, '59001', 'El monto total debe redondearse al entero más cercano');
    assert.equal(payload.items[0].unit_price, '59001');
    assert.equal(payload.payments[0].amount, '59001');
  });

  it('debe normalizar el email del pagador a minúsculas', () => {
    const dto = {
      transaction_amount: 29000,
      payment_method_id: 'debvisa',
      token: 'tok_1',
      payer: { email: 'JUAN.PEREZ@GMAIL.COM' },
    };

    const payload = buildMercadoPagoOrderPayload(dto);
    assert.equal(payload.payer.email, 'juan.perez@gmail.com');
  });
});

