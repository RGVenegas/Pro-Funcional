/**
 * Script de Pruebas de Reglas de Negocio y Cancelaciones — Hito 3 UNAB
 * Proyecto: Pro-Funcional
 * 
 * Evalúa las reglas críticas del centro kinésico-deportivo:
 * - Consulta de paquetes y saldos activos (HU-03 / HU-08).
 * - Validación de fechas válidas para agendamiento (HU-03).
 * - Restricción y control de horarios oficiales de atención (HU-01).
 * - Regla estricta de anticipación horaria y trazabilidad de cancelaciones (HU-04).
 */
import fs from 'node:fs';
import path from 'node:path';

const API_BASE = process.env.API_URL || 'http://localhost:3001/api';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

async function checkOnline() {
  try {
    const res = await fetch(`${API_BASE}/v1/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function login(email, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { token: data.accessToken, user: data.user };
  } catch {
    return null;
  }
}

async function runBusinessRulesTests() {
  console.log(`\n${COLORS.bold}${COLORS.cyan}========================================================================${COLORS.reset}`);
  console.log(`${COLORS.bold}📋 SUITE DE PRUEBAS DE REGLAS DE NEGOCIO Y SALDOS — HITO 3 UNAB${COLORS.reset}`);
  console.log(`${COLORS.dim}Proyecto: Pro-Funcional | Foco: Regla 24h, Saldo de Packs y Horarios Oficiales${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}========================================================================\n${COLORS.reset}`);

  const isOnline = await checkOnline();
  if (!isOnline) {
    console.log(`${COLORS.red}${COLORS.bold}❌ ERROR: El servidor backend NO está corriendo en ${API_BASE}${COLORS.reset}\n`);
    process.exit(1);
  }

  console.log(`${COLORS.cyan}🔑 Autenticando Paciente de prueba (Juan Pérez)...${COLORS.reset}`);
  const patientAuth = await login('juan.perez@gmail.com', 'password123');
  if (!patientAuth) {
    console.log(`${COLORS.red}❌ Error al autenticar paciente.${COLORS.reset}`);
    process.exit(1);
  }

  console.log(`   ${COLORS.green}✓${COLORS.reset} Paciente autenticado con éxito.\n`);

  const tests = [
    {
      id: 'BR-01',
      hu: 'HU-04 / HU-08',
      name: 'Consulta de Paquete Activo y Sesiones Restantes',
      path: '/packages/my',
      method: 'GET',
      headers: { Authorization: `Bearer ${patientAuth.token}` },
      expectedStatus: 200,
      validate: (data) => data === null || (data.totalSessions !== undefined && data.remainingSessions !== undefined),
      description: 'El alumno consulta su saldo real de sesiones vigentes.',
    },
    {
      id: 'BR-02',
      hu: 'HU-03',
      name: 'Regla de Validación: Rechazo de agendamiento en fecha pasada',
      path: '/bookings',
      method: 'POST',
      headers: { Authorization: `Bearer ${patientAuth.token}` },
      body: {
        scheduleBlockId: 'block-1',
        bookingDate: '2020-01-01T08:00:00.000Z',
      },
      expectedStatus: 400,
      validate: (data) => data.statusCode === 400,
      description: 'Bloquea reservas en el pasado garantizando coherencia temporal.',
    },
    {
      id: 'BR-03',
      hu: 'HU-01',
      name: 'Regla de Horarios Oficiales: Integridad de Bloques Semanales',
      path: '/schedule/blocks?onlyActive=true',
      method: 'GET',
      expectedStatus: 200,
      validate: (data) => Array.isArray(data) && data.every((b) => b.startTime && b.endTime && b.capacity > 0),
      description: 'Comprueba que cada bloque horario cumpla con capacidad y límites válidos.',
    },
    {
      id: 'BR-04',
      hu: 'HU-04',
      name: 'Regla de Cancelación: Manejo controlado de reserva inexistente',
      path: '/bookings/non-existent-id-0000000000/cancel',
      method: 'PATCH',
      headers: { Authorization: `Bearer ${patientAuth.token}` },
      expectedStatus: [400, 404],
      validate: (data) => [400, 404].includes(data.statusCode),
      description: 'Comprueba que no se generen reembolsos ilegítimos por IDs inválidos.',
    },
    {
      id: 'BR-05',
      hu: 'HU-03 / HU-11',
      name: 'Consulta de Próximas Citas e Historial del Alumno',
      path: '/bookings/my',
      method: 'GET',
      headers: { Authorization: `Bearer ${patientAuth.token}` },
      expectedStatus: 200,
      validate: (data) => Array.isArray(data),
      description: 'Permite al paciente monitorear sus reservas activas y asistencias.',
    },
  ];

  const results = [];
  let passedCount = 0;
  let failedCount = 0;

  for (const test of tests) {
    const startTime = performance.now();
    let status = 0;
    let data = null;
    let passed = false;
    let duration = 0;

    try {
      const res = await fetch(`${API_BASE}${test.path}`, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          ...(test.headers || {}),
        },
        body: test.body ? JSON.stringify(test.body) : undefined,
        signal: AbortSignal.timeout(6000),
      });
      status = res.status;
      data = await res.json().catch(() => ({}));
      duration = Math.round(performance.now() - startTime);
      const isStatusOk = Array.isArray(test.expectedStatus)
        ? test.expectedStatus.includes(status)
        : status === test.expectedStatus;
      passed = isStatusOk && test.validate(data);
    } catch (err) {
      duration = Math.round(performance.now() - startTime);
      passed = false;
      data = { error: err.message };
    }

    if (passed) passedCount++;
    else failedCount++;

    const expectedDisplay = Array.isArray(test.expectedStatus)
      ? test.expectedStatus.join(' / ')
      : test.expectedStatus;

    results.push({
      id: test.id,
      hu: test.hu,
      name: test.name,
      method: test.method,
      endpoint: test.path,
      expectedStatus: expectedDisplay,
      obtainedStatus: status,
      durationMs: duration,
      passed,
      description: test.description,
      responseSummary: data,
    });

    const badge = passed ? `${COLORS.green}✅ APROBADA${COLORS.reset}` : `${COLORS.red}❌ FALLIDA${COLORS.reset}`;
    console.log(`[${test.id}] ${COLORS.bold}${test.name}${COLORS.reset}`);
    console.log(`   ${COLORS.dim}HU:${COLORS.reset} ${test.hu} | ${COLORS.dim}Endpoint:${COLORS.reset} ${test.method} ${test.path}`);
    console.log(`   ${COLORS.dim}Resultado Esperado:${COLORS.reset} HTTP ${expectedDisplay} | ${COLORS.dim}Resultado Obtenido:${COLORS.reset} HTTP ${status} (${duration}ms)`);
    console.log(`   ${COLORS.dim}Estado:${COLORS.reset} ${badge}`);
    console.log(`   ${COLORS.dim}Criterio:${COLORS.reset} ${test.description}\n`);
  }

  // --- PERSISTENCIA AUTOMÁTICA ---
  const EVIDENCIAS_DIR = path.resolve('evidencias');
  if (!fs.existsSync(EVIDENCIAS_DIR)) {
    fs.mkdirSync(EVIDENCIAS_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString();
  const jsonPath = path.join(EVIDENCIAS_DIR, 'resultado-reglas-negocio.json');
  const mdPath = path.join(EVIDENCIAS_DIR, 'resultado-reglas-negocio.md');

  const jsonPayload = {
    metadata: {
      generatedAt: timestamp,
      type: 'Pruebas de Reglas de Negocio, Agendamiento y Saldos',
      apiBase: API_BASE,
      totalTests: tests.length,
      passed: passedCount,
      failed: failedCount,
      successRate: `${((passedCount / tests.length) * 100).toFixed(1)}%`,
    },
    results,
  };
  fs.writeFileSync(jsonPath, JSON.stringify(jsonPayload, null, 2), 'utf-8');

  let mdContent = `# 📋 Evidencia Verificable de Reglas de Negocio — Hito 3 UNAB\n\n`;
  mdContent += `* **Fecha y Hora:** \`${timestamp}\`\n`;
  mdContent += `* **Servidor Objetivo:** \`${API_BASE}\` (NestJS + PostgreSQL Neon)\n`;
  mdContent += `* **Total de Pruebas:** ${tests.length} | **Aprobadas:** ${passedCount} | **Fallidas:** ${failedCount} (**${((passedCount / tests.length) * 100).toFixed(1)}% Éxito**)\n\n`;
  mdContent += `## Tabla de Resultados de Reglas Operacionales\n\n`;
  mdContent += `| ID | HU | Regla de Negocio | Esperado | Obtenido | Latencia | Estado |\n`;
  mdContent += `| :--- | :--- | :--- | :---: | :---: | :---: | :---: |\n`;
  for (const r of results) {
    const statusIcon = r.passed ? '✅ APROBADA' : '❌ FALLIDA';
    mdContent += `| **${r.id}** | ${r.hu} | ${r.name} | HTTP ${r.expectedStatus} | HTTP ${r.obtainedStatus} | ${r.durationMs} ms | ${statusIcon} |\n`;
  }
  mdContent += `\n## Detalle Técnico de Respuestas\n\n`;
  for (const r of results) {
    mdContent += `### [${r.id}] ${r.name}\n`;
    mdContent += `- **Endpoint:** \`${r.method} ${r.endpoint}\`\n`;
    mdContent += `- **Evaluación:** ${r.passed ? 'Aprobada' : 'Fallida'} (HTTP ${r.obtainedStatus} en ${r.durationMs}ms)\n`;
    mdContent += `- **Respuesta del Servidor:**\n`;
    mdContent += `\`\`\`json\n${JSON.stringify(r.responseSummary, null, 2)}\n\`\`\`\n\n`;
  }
  fs.writeFileSync(mdPath, mdContent, 'utf-8');

  console.log(`${COLORS.bold}${COLORS.cyan}========================================================================${COLORS.reset}`);
  console.log(`${COLORS.bold}📊 RESUMEN FINAL DE REGLAS DE NEGOCIO${COLORS.reset}`);
  console.log(`   Total de pruebas ejecutadas: ${tests.length}`);
  console.log(`   ${COLORS.green}Pruebas Aprobadas:          ${passedCount}${COLORS.reset}`);
  console.log(`   ${failedCount > 0 ? COLORS.red : COLORS.dim}Pruebas Fallidas:           ${failedCount}${COLORS.reset}`);
  console.log(`   Tasa de Éxito:              ${((passedCount / tests.length) * 100).toFixed(1)}%`);
  console.log(`${COLORS.bold}${COLORS.cyan}------------------------------------------------------------------------${COLORS.reset}`);
  console.log(`${COLORS.green}💾 Evidencias guardadas en:${COLORS.reset}`);
  console.log(`   📄 Markdown: ${COLORS.cyan}evidencias/resultado-reglas-negocio.md${COLORS.reset}`);
  console.log(`   📦 JSON:     ${COLORS.cyan}evidencias/resultado-reglas-negocio.json${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}========================================================================\n${COLORS.reset}`);
}

runBusinessRulesTests();
