import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const BOOKING_NOTICE_HOURS = 3;

/**
 * Evalúa política de cancelación con devolución o penalización
 * Basada en BookingService.cancel (backend/src/bookings/booking-transactions.ts)
 */
export function evaluateCancellationPolicy(booking, pack, nowMs = Date.now()) {
  if (booking.status === 'CANCELLED') {
    throw new Error('La reserva ya se encuentra cancelada.');
  }

  const bookingTime = new Date(booking.bookingDate).getTime();
  if (bookingTime <= nowMs) {
    throw new Error('No es posible cancelar una reserva pasada.');
  }

  const eligible = (bookingTime - nowMs) >= BOOKING_NOTICE_HOURS * 3600000;
  let isRefunded = false;
  let newRemainingSessions = pack ? pack.remainingSessions : 0;

  if (eligible) {
    if (!booking.packageId || !pack) {
      throw new Error('Esta reserva requiere paquete asociado para procesar devolución.');
    }
    if (pack.remainingSessions >= pack.totalSessions) {
      throw new Error('El saldo del paquete ya alcanzó su cupo total.');
    }
    newRemainingSessions = pack.remainingSessions + 1;
    isRefunded = true;
  }

  return {
    status: 'CANCELLED',
    isRefunded,
    remainingSessions: newRemainingSessions,
    message: isRefunded
      ? 'Cupo liberado y sesión devuelta al paquete original.'
      : 'Cupo liberado. Al faltar menos de 3 horas, la sesión no se devuelve.',
  };
}

/**
 * Evalúa viabilidad de reagendamiento de clase
 * Basada en BookingService.reschedule (backend/src/bookings/booking-transactions.ts)
 */
export function evaluateRescheduleEligibility(originalBooking, pack, newBookingDateStr, nowMs = Date.now()) {
  const origTime = new Date(originalBooking.bookingDate).getTime();
  const eligible = (origTime - nowMs) >= BOOKING_NOTICE_HOURS * 3600000;

  if (!eligible) {
    throw new Error(`Los cambios de clase solo se permiten con al menos ${BOOKING_NOTICE_HOURS} horas de anticipación.`);
  }

  const newDate = new Date(newBookingDateStr);
  if (pack && pack.expiresAt && pack.expiresAt < newDate) {
    throw new Error('La nueva fecha supera la vigencia del paquete.');
  }

  return {
    allowed: true,
    message: 'Reserva reagendada sin alterar el saldo.',
    newBookingDate: newDate,
  };
}

/**
 * Validador de aforo y colisiones de horarios
 */
export function validateSlotCapacityAndCollision(block, existingReservations, userId, dateStr) {
  const countInSlot = existingReservations.filter(
    (b) => b.scheduleBlockId === block.id && b.status !== 'CANCELLED' && b.date === dateStr
  ).length;

  if (countInSlot >= block.capacity) {
    throw new Error('Cupos agotados en esta fecha.');
  }

  const userHasConflict = existingReservations.some(
    (b) => b.userId === userId && b.status !== 'CANCELLED' && b.date === dateStr && b.scheduleBlockId === block.id
  );

  if (userHasConflict) {
    throw new Error('Ya tienes una reserva que coincide con este horario.');
  }

  return { available: true, remainingSpots: block.capacity - countInSlot - 1 };
}

describe('Unit Tests: Políticas de Reserva, Cancelación y Aforo (booking-transactions.ts)', () => {
  it('cancelación con >= 3 horas de anticipación debe devolver la sesión al paquete', () => {
    const futureBooking = {
      id: 'book-100',
      status: 'RESERVED',
      bookingDate: new Date(Date.now() + 5 * 3600000), // En 5 horas
      packageId: 'pack-1',
    };

    const currentPack = {
      id: 'pack-1',
      totalSessions: 8,
      remainingSessions: 5,
    };

    const result = evaluateCancellationPolicy(futureBooking, currentPack);

    assert.equal(result.isRefunded, true, 'Debe devolver la sesión');
    assert.equal(result.remainingSessions, 6, 'El saldo restante debe incrementar en 1');
    assert.ok(result.message.includes('sesión devuelta al paquete'));
  });

  it('cancelación con < 3 horas de anticipación libera el cupo pero NO devuelve la sesión', () => {
    const imminentBooking = {
      id: 'book-101',
      status: 'RESERVED',
      bookingDate: new Date(Date.now() + 1.5 * 3600000), // En 90 minutos (< 3h)
      packageId: 'pack-1',
    };

    const currentPack = {
      id: 'pack-1',
      totalSessions: 8,
      remainingSessions: 4,
    };

    const result = evaluateCancellationPolicy(imminentBooking, currentPack);

    assert.equal(result.isRefunded, false, 'NO debe devolver la sesión por no cumplir anticipación');
    assert.equal(result.remainingSessions, 4, 'El saldo del paquete se mantiene igual');
    assert.ok(result.message.includes('sin devolución por plazo menor a 3h') || result.message.includes('no se devuelve'));
  });

  it('cancelación de cita pasada debe ser rechazada con error', () => {
    const pastBooking = {
      id: 'book-102',
      status: 'RESERVED',
      bookingDate: new Date(Date.now() - 3600000), // Hace 1 hora
      packageId: 'pack-1',
    };

    assert.throws(
      () => evaluateCancellationPolicy(pastBooking, { remainingSessions: 2, totalSessions: 8 }),
      /No es posible cancelar una reserva pasada/
    );
  });

  it('reagendamiento con menos de 3 horas de anticipación debe ser rechazado', () => {
    const booking = {
      bookingDate: new Date(Date.now() + 2 * 3600000), // En 2 horas (< 3h)
    };

    assert.throws(
      () => evaluateRescheduleEligibility(booking, null, '2026-11-05T10:00:00Z'),
      /solo se permiten con al menos 3 horas de anticipación/
    );
  });

  it('reagendamiento a una fecha posterior a la vigencia del paquete debe ser bloqueado', () => {
    const booking = {
      bookingDate: new Date(Date.now() + 24 * 3600000), // En 24 horas
    };

    const pack = {
      expiresAt: new Date('2026-11-01T23:59:59Z'), // Vence el 1 de nov
    };

    // Intenta reagendar para el 15 de nov (vencido)
    assert.throws(
      () => evaluateRescheduleEligibility(booking, pack, '2026-11-15T10:00:00Z'),
      /La nueva fecha supera la vigencia del paquete/
    );
  });

  it('validador de aforo debe bloquear agendamiento en Box Kinésico cuando aforo = 1', () => {
    const kineBox = {
      id: 'block-kine-1',
      title: 'Box Clínico Kinesiología 1',
      capacity: 1, // Capacidad estricta de 1 paciente
    };

    const existingBookings = [
      { id: 'b1', scheduleBlockId: 'block-kine-1', userId: 'patient-A', status: 'RESERVED', date: '2026-11-02' },
    ];

    // Intentar reservar por paciente B cuando ya está ocupado
    assert.throws(
      () => validateSlotCapacityAndCollision(kineBox, existingBookings, 'patient-B', '2026-11-02'),
      /Cupos agotados en esta fecha/
    );
  });

  it('validador de duplicidad debe impedir que un paciente reserve dos veces la misma clase', () => {
    const functionalBlock = {
      id: 'block-func-1',
      title: 'Entrenamiento Funcional HIIT',
      capacity: 12,
    };

    const existingBookings = [
      { id: 'b1', scheduleBlockId: 'block-func-1', userId: 'patient-A', status: 'RESERVED', date: '2026-11-02' },
    ];

    assert.throws(
      () => validateSlotCapacityAndCollision(functionalBlock, existingBookings, 'patient-A', '2026-11-02'),
      /Ya tienes una reserva que coincide con este horario/
    );
  });
});

