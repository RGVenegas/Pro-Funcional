/**
 * Script de Pruebas de Ficha Clínica SOAP, Escala EVA y Rango ROM — Hito 3 UNAB
 * Proyecto: Pro-Funcional
 * 
 * Evalúa el registro médico kinésico (HU-05), casos límite de escala de dolor
 * (EVA 1-10) y rango articular (ROM 0-360°), persistencia y privacidad del paciente.
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

async function runClinicalTests() {
  console.log(`\n${COLORS.bold}${COLORS.cyan}========================================================================${COLORS.reset}`);
  console.log(`${COLORS.bold}🩺 SUITE DE PRUEBAS DE FICHA CLÍNICA KINÉSICA (SOAP, EVA & ROM) — HITO 3${COLORS.reset}`);
  console.log(`${COLORS.dim}Proyecto: Pro-Funcional | Historias: HU-05 (Ficha Médica) & HU-06 (Curvas de Avance)${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}========================================================================\n${COLORS.reset}`);

  const isOnline = await checkOnline();
  if (!isOnline) {
    console.log(`${COLORS.red}${COLORS.bold}❌ ERROR: El servidor backend NO está corriendo en ${API_BASE}${COLORS.reset}\n`);
    process.exit(1);
  }

  console.log(`${COLORS.cyan}🔑 Autenticando Kinesiólogo y Paciente de prueba...${COLORS.reset}`);
  const kineAuth = await login('andres.morales@profuncional.cl', 'admin1234');
  const patientAuth = await login('juan.perez@gmail.com', 'password123');

  if (!kineAuth || !patientAuth) {
    console.log(`${COLORS.red}❌ Error al autenticar usuarios de prueba.${COLORS.reset}`);
    process.exit(1);
  }

  console.log(`   ${COLORS.green}✓${COLORS.reset} Kinesiólogo autenticado (${kineAuth.user.name})`);
  console.log(`   ${COLORS.green}✓${COLORS.reset} Paciente autenticado (${patientAuth.user.name} - ID: ${patientAuth.user.id})\n`);

  const tests = [
    {
      id: 'CLN-01',
      name: 'Kinesiólogo consulta historial clínico del paciente',
      path: `/clinical/history/${patientAuth.user.id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${kineAuth.token}` },
      expectedStatus: 200,
      validate: (data) => Array.isArray(data?.history) && Array.isArray(data?.chartData),
      description: 'Acceso autorizado a evoluciones previas y curvas Recharts.',
    },
    {
      id: 'CLN-02',
      name: 'Registro exitoso de Ficha Clínica SOAP (Datos válidos)',
      path: `/clinical/evaluations/${patientAuth.user.id}`,
      method: 'POST',
      headers: { Authorization: `Bearer ${kineAuth.token}` },
      body: {
        evaPain: 4,
        romDegrees: 115,
        jointOrArea: 'Rodilla derecha',
        subjective: 'Paciente refiere menor dolor matutino (EVA 4/10).',
        objective: 'Flexión de rodilla a 115° sin signos de derrame.',
        assessment: 'Evolución satisfactoria de tendinopatía rotuliana.',
        plan: 'Inicio de sentadillas excéntricas en polea cónica.',
        physicalRestrictions: 'Evitar impacto alto en salto / Cuidado en aterrizaje',
      },
      expectedStatus: [200, 201],
      validate: (data) => data.id && data.evaPain === 4 && data.romDegrees === 115,
      description: 'Persistencia íntegra de notas SOAP, EVA y ROM en PostgreSQL.',
    },
    {
      id: 'CLN-03',
      name: 'Caso Límite: Intento de ingresar escala de dolor fuera de rango (EVA = 15)',
      path: `/clinical/evaluations/${patientAuth.user.id}`,
      method: 'POST',
      headers: { Authorization: `Bearer ${kineAuth.token}` },
      body: {
        evaPain: 15,
        romDegrees: 90,
        jointOrArea: 'Hombro',
        subjective: 'Test',
        objective: 'Test',
        assessment: 'Test',
        plan: 'Test',
      },
      expectedStatus: 400,
      validate: (data) => data.statusCode === 400 && JSON.stringify(data).includes('EVA'),
      description: 'Validador @Max(10) rechaza dolor superior a la escala clínica internacional.',
    },
    {
      id: 'CLN-04',
      name: 'Caso Límite: Intento de ingresar Rango Articular negativo (ROM = -20°)',
      path: `/clinical/evaluations/${patientAuth.user.id}`,
      method: 'POST',
      headers: { Authorization: `Bearer ${kineAuth.token}` },
      body: {
        evaPain: 5,
        romDegrees: -20,
        jointOrArea: 'Cadera',
        subjective: 'Test',
        objective: 'Test',
        assessment: 'Test',
        plan: 'Test',
      },
      expectedStatus: 400,
      validate: (data) => data.statusCode === 400 && JSON.stringify(data).includes('ROM'),
      description: 'Validador @Min(0) impide ángulos biomecánicos negativos erróneos.',
    },
    {
      id: 'CLN-05',
      name: 'Paciente consulta su propio avance clínico (Curvas de progreso HU-06)',
      path: '/clinical/my-history',
      method: 'GET',
      headers: { Authorization: `Bearer ${patientAuth.token}` },
      expectedStatus: 200,
      validate: (data) => Array.isArray(data?.history) && Array.isArray(data?.chartData),
      description: 'Retorno seguro de registros del propio paciente para visualización gráfica.',
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
    console.log(`   ${COLORS.dim}Endpoint:${COLORS.reset} ${test.method} ${test.path}`);
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
  const jsonPath = path.join(EVIDENCIAS_DIR, 'resultado-ficha-clinica.json');
  const mdPath = path.join(EVIDENCIAS_DIR, 'resultado-ficha-clinica.md');

  const jsonPayload = {
    metadata: {
      generatedAt: timestamp,
      type: 'Pruebas de Ficha Clínica Kinésica (SOAP, EVA & ROM)',
      apiBase: API_BASE,
      totalTests: tests.length,
      passed: passedCount,
      failed: failedCount,
      successRate: `${((passedCount / tests.length) * 100).toFixed(1)}%`,
    },
    results,
  };
  fs.writeFileSync(jsonPath, JSON.stringify(jsonPayload, null, 2), 'utf-8');

  let mdContent = `# 🩺 Evidencia Verificable de Fichas Clínicas (SOAP, EVA & ROM) — Hito 3 UNAB\n\n`;
  mdContent += `* **Fecha y Hora:** \`${timestamp}\`\n`;
  mdContent += `* **Servidor Objetivo:** \`${API_BASE}\` (NestJS + PostgreSQL Neon)\n`;
  mdContent += `* **Historias de Usuario:** HU-05 (Ficha SOAP/EVA/ROM) & HU-06 (Curvas de Progreso)\n`;
  mdContent += `* **Total de Pruebas:** ${tests.length} | **Aprobadas:** ${passedCount} | **Fallidas:** ${failedCount} (**${((passedCount / tests.length) * 100).toFixed(1)}% Éxito**)\n\n`;
  mdContent += `## Tabla de Casos Clínicos y Casos Límite\n\n`;
  mdContent += `| ID | Caso de Prueba | Esperado | Obtenido | Latencia | Estado |\n`;
  mdContent += `| :--- | :--- | :---: | :---: | :---: | :---: |\n`;
  for (const r of results) {
    const statusIcon = r.passed ? '✅ APROBADA' : '❌ FALLIDA';
    mdContent += `| **${r.id}** | ${r.name} | HTTP ${r.expectedStatus} | HTTP ${r.obtainedStatus} | ${r.durationMs} ms | ${statusIcon} |\n`;
  }
  mdContent += `\n## Detalle Técnico de Respuestas Médicas\n\n`;
  for (const r of results) {
    mdContent += `### [${r.id}] ${r.name}\n`;
    mdContent += `- **Endpoint:** \`${r.method} ${r.endpoint}\`\n`;
    mdContent += `- **Evaluación:** ${r.passed ? 'Aprobada' : 'Fallida'} (HTTP ${r.obtainedStatus} en ${r.durationMs}ms)\n`;
    mdContent += `- **Payload / Registro Almacenado:**\n`;
    mdContent += `\`\`\`json\n${JSON.stringify(r.responseSummary, null, 2)}\n\`\`\`\n\n`;
  }
  fs.writeFileSync(mdPath, mdContent, 'utf-8');

  console.log(`${COLORS.bold}${COLORS.cyan}========================================================================${COLORS.reset}`);
  console.log(`${COLORS.bold}📊 RESUMEN FINAL DE PRUEBAS CLÍNICAS${COLORS.reset}`);
  console.log(`   Total de pruebas ejecutadas: ${tests.length}`);
  console.log(`   ${COLORS.green}Pruebas Aprobadas:          ${passedCount}${COLORS.reset}`);
  console.log(`   ${failedCount > 0 ? COLORS.red : COLORS.dim}Pruebas Fallidas:           ${failedCount}${COLORS.reset}`);
  console.log(`   Tasa de Éxito Clínico:      ${((passedCount / tests.length) * 100).toFixed(1)}%`);
  console.log(`${COLORS.bold}${COLORS.cyan}------------------------------------------------------------------------${COLORS.reset}`);
  console.log(`${COLORS.green}💾 Evidencias guardadas en:${COLORS.reset}`);
  console.log(`   📄 Markdown: ${COLORS.cyan}evidencias/resultado-ficha-clinica.md${COLORS.reset}`);
  console.log(`   📦 JSON:     ${COLORS.cyan}evidencias/resultado-ficha-clinica.json${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}========================================================================\n${COLORS.reset}`);
}

runClinicalTests();
