import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Función de formateo de historial kinésico para gráficos de Recharts
 * Extraída de ClinicalService.getPatientHistory
 */
export function formatPatientHistoryForCharts(records) {
  return [...records].reverse().map((r, idx) => ({
    session: `Sesión ${idx + 1}`,
    date: new Date(r.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }),
    evaPain: r.evaPain,
    romDegrees: r.romDegrees,
    jointOrArea: r.jointOrArea,
    note: r.assessment,
  }));
}

/**
 * Validador de regla de negocio para registro clínico SOAP / EVA / ROM
 */
export function validateClinicalEvaluation(dto) {
  const errors = [];

  if (typeof dto.evaPain !== 'number' || !Number.isInteger(dto.evaPain)) {
    errors.push('El valor de EVA debe ser un número entero');
  } else if (dto.evaPain < 1 || dto.evaPain > 10) {
    errors.push('El valor de EVA debe ser entre 1 y 10');
  }

  if (typeof dto.romDegrees !== 'number' || !Number.isInteger(dto.romDegrees)) {
    errors.push('Los grados ROM deben ser un número entero');
  } else if (dto.romDegrees < 0 || dto.romDegrees > 360) {
    errors.push('Los grados ROM deben estar entre 0 y 360');
  }

  if (!dto.jointOrArea || typeof dto.jointOrArea !== 'string' || dto.jointOrArea.trim() === '') {
    errors.push('La articulación o zona anatómica es requerida');
  }

  for (const field of ['subjective', 'objective', 'assessment', 'plan']) {
    if (!dto[field] || typeof dto[field] !== 'string' || dto[field].trim() === '') {
      errors.push(`El campo SOAP '${field}' es requerido`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Lógica de invalidación de rutina tras nueva evaluación médica
 * Extraída de ClinicalService.createEvaluation
 */
export function applyEvaluationCareUpdate(currentCare) {
  const care = structuredClone(currentCare || {});
  if (care.routine) {
    care.routine.status = 'draft';
    delete care.routine.approvedAt;
    delete care.routine.approvedBy;
  }
  return care;
}

describe('Unit Tests: Dominio Clínico Kinésico (SOAP, EVA, ROM & Recharts)', () => {
  it('debe validar exitosamente una evaluación kinésica con valores válidos', () => {
    const validDto = {
      evaPain: 4,
      romDegrees: 120,
      jointOrArea: 'Rodilla derecha',
      subjective: 'Paciente refiere disminución de dolor al subir escaleras',
      objective: 'Sin derrame articular, ROM flexión 120° pasiva',
      assessment: 'Fase de readaptación con evolución positiva',
      plan: 'Mantener protocolo excéntrico de cuádriceps',
      physicalRestrictions: 'Evitar sentadillas profundas > 90°',
    };

    const result = validateClinicalEvaluation(validDto);
    assert.equal(result.isValid, true);
    assert.equal(result.errors.length, 0);
  });

  it('debe rechazar escala de dolor EVA fuera de rango [1, 10]', () => {
    const dtoEvaTooHigh = {
      evaPain: 15, // Caso límite fuera de rango
      romDegrees: 90,
      jointOrArea: 'Hombro',
      subjective: 'Dolor agudo',
      objective: 'Inflamación',
      assessment: 'Tendinitis',
      plan: 'Crioterapia',
    };
    const resHigh = validateClinicalEvaluation(dtoEvaTooHigh);
    assert.equal(resHigh.isValid, false);
    assert.ok(resHigh.errors.some(e => e.includes('EVA')));

    const dtoEvaZero = { ...dtoEvaTooHigh, evaPain: 0 };
    const resZero = validateClinicalEvaluation(dtoEvaZero);
    assert.equal(resZero.isValid, false);

    const dtoEvaDecimal = { ...dtoEvaTooHigh, evaPain: 4.5 };
    const resDecimal = validateClinicalEvaluation(dtoEvaDecimal);
    assert.equal(resDecimal.isValid, false, 'EVA no debe admitir decimales');
  });

  it('debe rechazar grados ROM fuera de rango fisiológico [0, 360]', () => {
    const dtoNegativeRom = {
      evaPain: 5,
      romDegrees: -15, // Inválido
      jointOrArea: 'Tobillo',
      subjective: 'S', objective: 'O', assessment: 'A', plan: 'P',
    };
    const resNeg = validateClinicalEvaluation(dtoNegativeRom);
    assert.equal(resNeg.isValid, false);
    assert.ok(resNeg.errors.some(e => e.includes('ROM')));

    const dtoExceededRom = { ...dtoNegativeRom, romDegrees: 400 };
    const resExc = validateClinicalEvaluation(dtoExceededRom);
    assert.equal(resExc.isValid, false);
  });

  it('debe exigir todos los campos de la nota médica SOAP', () => {
    const missingSoap = {
      evaPain: 3,
      romDegrees: 90,
      jointOrArea: 'Cadera',
      subjective: '', // Vacío
      objective: '   ', // Solo espacios
      assessment: 'Diagnóstico',
      plan: 'Tratamiento',
    };
    const res = validateClinicalEvaluation(missingSoap);
    assert.equal(res.isValid, false);
    assert.equal(res.errors.length, 2, 'Debe señalar falta de subjective y objective');
  });

  it('formatPatientHistoryForCharts() debe transformar registros en orden cronológico con sesiones numeradas', () => {
    // La BD retorna orden desc (más reciente primero)
    const dbRecords = [
      {
        id: 'eval-3',
        date: new Date('2026-10-25T10:00:00Z'),
        evaPain: 2,
        romDegrees: 135,
        jointOrArea: 'Rodilla derecha',
        assessment: 'Alta kinésica próxima',
      },
      {
        id: 'eval-2',
        date: new Date('2026-10-15T10:00:00Z'),
        evaPain: 5,
        romDegrees: 110,
        jointOrArea: 'Rodilla derecha',
        assessment: 'Progreso favorable',
      },
      {
        id: 'eval-1',
        date: new Date('2026-10-01T10:00:00Z'),
        evaPain: 8,
        romDegrees: 80,
        jointOrArea: 'Rodilla derecha',
        assessment: 'Inicio rehabilitación post-esguince',
      },
    ];

    const chartData = formatPatientHistoryForCharts(dbRecords);

    assert.equal(chartData.length, 3);
    // Debe invertirse cronológicamente: Sesión 1 = eval-1, Sesión 3 = eval-3
    assert.equal(chartData[0].session, 'Sesión 1');
    assert.equal(chartData[0].evaPain, 8);
    assert.equal(chartData[0].romDegrees, 80);
    assert.equal(chartData[0].note, 'Inicio rehabilitación post-esguince');

    assert.equal(chartData[2].session, 'Sesión 3');
    assert.equal(chartData[2].evaPain, 2);
    assert.equal(chartData[2].romDegrees, 135);
    assert.equal(chartData[2].note, 'Alta kinésica próxima');
  });

  it('applyEvaluationCareUpdate() debe invalidar la rutina activa pasándola a borrador para revisión kinésica', () => {
    const existingCare = {
      routine: {
        id: 'routine-123',
        status: 'approved',
        approvedAt: '2026-10-10T00:00:00Z',
        approvedBy: 'Klgo. Andrés Morales',
        exercises: ['Sentadilla búlgara', 'Puente de glúteo'],
      },
    };

    const updatedCare = applyEvaluationCareUpdate(existingCare);

    assert.equal(updatedCare.routine.status, 'draft', 'El estado debe revertirse a borrador tras nueva evaluación');
    assert.equal(updatedCare.routine.approvedAt, undefined, 'approvedAt debe eliminarse');
    assert.equal(updatedCare.routine.approvedBy, undefined, 'approvedBy debe eliminarse');
    assert.deepEqual(updatedCare.routine.exercises, ['Sentadilla búlgara', 'Puente de glúteo'], 'Los ejercicios deben conservarse');
  });
});

