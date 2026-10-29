import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock del entorno de navegador para Node.js
const storageMap = new Map();
globalThis.localStorage = {
  getItem: (k) => (storageMap.has(k) ? storageMap.get(k) : null),
  setItem: (k, v) => storageMap.set(k, String(v)),
  removeItem: (k) => storageMap.delete(k),
  clear: () => storageMap.clear(),
};
globalThis.window = {
  dispatchEvent: () => true,
};
globalThis.Event = class Event {
  constructor(type) {
    this.type = type;
  }
};

import {
  enqueueMutation,
  getOfflineQueue,
  removeMutation,
  clearOfflineQueue,
  processOfflineQueue,
} from '../../src/app/data/offlineQueue.ts';

describe('Unit Tests: Cola de Mutaciones Offline (offlineQueue.ts)', () => {
  beforeEach(() => {
    clearOfflineQueue();
  });

  it('enqueueMutation() debe encolar operaciones con timestamp e identificador único', () => {
    const item1 = enqueueMutation('/api/bookings', 'POST', { blockId: 'b-1' }, 'Reserva bloque 1');
    assert.ok(item1.id.startsWith('queue_'));
    assert.equal(item1.path, '/api/bookings');
    assert.equal(item1.method, 'POST');
    assert.equal(item1.description, 'Reserva bloque 1');
    assert.ok(item1.timestamp > 0);

    const queue = getOfflineQueue();
    assert.equal(queue.length, 1);
    assert.equal(queue[0].id, item1.id);
  });

  it('removeMutation() debe eliminar una mutación específica preservando las demás', () => {
    const m1 = enqueueMutation('/api/evaluations', 'POST', { eva: 4 });
    const m2 = enqueueMutation('/api/bookings/1/cancel', 'PATCH');
    const m3 = enqueueMutation('/api/profile', 'PUT', { phone: '123' });

    assert.equal(getOfflineQueue().length, 3);

    removeMutation(m2.id);

    const remaining = getOfflineQueue();
    assert.equal(remaining.length, 2);
    assert.ok(!remaining.some((m) => m.id === m2.id));
    assert.ok(remaining.some((m) => m.id === m1.id));
    assert.ok(remaining.some((m) => m.id === m3.id));
  });

  it('processOfflineQueue() debe procesar elementos en orden FIFO y removerlos si tienen éxito', async () => {
    enqueueMutation('/api/test1', 'POST', { n: 1 });
    enqueueMutation('/api/test2', 'POST', { n: 2 });
    enqueueMutation('/api/test3', 'POST', { n: 3 });

    const processedPaths = [];
    const mockRequestFn = async (path, method, body) => {
      processedPaths.push({ path, method, body });
      return { ok: true };
    };

    const result = await processOfflineQueue(mockRequestFn);

    assert.equal(result.syncedCount, 3);
    assert.equal(result.errors, 0);
    assert.deepEqual(
      processedPaths.map((p) => p.path),
      ['/api/test1', '/api/test2', '/api/test3'],
      'Debe procesar estrictamente en orden secuencial FIFO'
    );
    assert.equal(getOfflineQueue().length, 0, 'La cola debe quedar limpia tras sincronización exitosa');
  });

  it('processOfflineQueue() debe detener el procesamiento en cadena si un elemento falla para mantener consistencia', async () => {
    enqueueMutation('/api/step1-ok', 'POST');
    enqueueMutation('/api/step2-fail', 'POST');
    enqueueMutation('/api/step3-pending', 'POST');

    const executed = [];
    const mockRequestFn = async (path) => {
      executed.push(path);
      if (path === '/api/step2-fail') {
        throw new Error('500 Internal Server Error simulado');
      }
      return { ok: true };
    };

    const result = await processOfflineQueue(mockRequestFn);

    assert.equal(result.syncedCount, 1, 'Solo step1-ok debió sincronizarse');
    assert.equal(result.errors, 1, 'step2 falló');
    assert.deepEqual(executed, ['/api/step1-ok', '/api/step2-fail'], 'No debió intentar ejecutar step3');

    const remaining = getOfflineQueue();
    assert.equal(remaining.length, 2, 'Deben quedar step2 y step3 en la cola');
    assert.equal(remaining[0].path, '/api/step2-fail');
    assert.equal(remaining[1].path, '/api/step3-pending');
  });
});

