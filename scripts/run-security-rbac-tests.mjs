/**
 * Script de Pruebas de Seguridad y Control de Acceso por Roles (RBAC) — Hito 3 UNAB
 * Proyecto: Pro-Funcional
 * 
 * Evalúa los límites de seguridad, separación de privilegios (Admin/Staff vs Paciente),
 * integridad de DTOs y validación de Guards contra la base de datos real.
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

async function runSecurityTests() {
  console.log(`\n${COLORS.bold}${COLORS.cyan}========================================================================${COLORS.reset}`);
  console.log(`${COLORS.bold}🛡️  SUITE DE PRUEBAS DE SEGURIDAD Y PRIVILEGIOS RBAC — HITO 3 UNAB${COLORS.reset}`);
  console.log(`${COLORS.dim}Proyecto: Pro-Funcional | Foco: Confidencialidad Médica y Control de Acceso${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}========================================================================\n${COLORS.reset}`);

  const isOnline = await checkOnline();
  if (!isOnline) {
    console.log(`${COLORS.red}${COLORS.bold}❌ ERROR: El servidor backend NO está corriendo en ${API_BASE}${COLORS.reset}\n`);
    console.log(`Por favor levanta el backend con 'npm run start:dev' dentro de backend/`);
    process.exit(1);
  }

  console.log(`${COLORS.cyan}🔑 Obteniendo credenciales y tokens JWT para los diferentes roles...${COLORS.reset}`);
  const adminAuth = await login('admin@profuncional.cl', 'admin1234');
  const patientAuth = await login('juan.perez@gmail.com', 'password123');

  if (!adminAuth || !patientAuth) {
    console.log(`${COLORS.red}❌ Error al obtener tokens de prueba desde la base de datos.${COLORS.reset}`);
    process.exit(1);
  }

  console.log(`   ${COLORS.green}✓${COLORS.reset} Token Admin obtenido (${adminAuth.user.role})`);
  console.log(`   ${COLORS.green}✓${COLORS.reset} Token Paciente obtenido (${patientAuth.user.role})\n`);

  const tests = [
    {
      id: 'SEC-01',
      name: 'Intento de consulta a Parrilla Staff sin Token (No autenticado)',
      path: '/schedule/grid?date=2026-11-02',
      method: 'GET',
      headers: {},
      expectedStatus: 401,
      validate: (data) => data.statusCode === 401,
      description: 'El JwtAuthGuard bloquea peticiones sin cabecera Bearer.',
    },
    {
      id: 'SEC-02',
      name: 'Paciente intentando crear Bloque Horario en la Agenda (Escalamiento)',
      path: '/schedule/blocks',
      method: 'POST',
      headers: { Authorization: `Bearer ${patientAuth.token}` },
      body: {
        dayOfWeek: 'Monday',
        startTime: '07:00',
        endTime: '08:00',
        title: 'Bloque Ilícito Paciente',
        instructor: 'Hack',
        capacity: 10,
      },
      expectedStatus: 403,
      validate: (data) => data.statusCode === 403,
      description: 'El RolesGuard intercepta el rol PATIENT y niega acceso administrativo.',
    },
    {
      id: 'SEC-03',
      name: 'Paciente intentando registrar Ficha Clínica SOAP (Privacidad médica)',
      path: `/clinical/evaluations/${patientAuth.user.id}`,
      method: 'POST',
      headers: { Authorization: `Bearer ${patientAuth.token}` },
      body: {
        evaPain: 1,
        romDegrees: 90,
        jointOrArea: 'Rodilla',
        subjective: 'Test',
        objective: 'Test',
        assessment: 'Test',
        plan: 'Test',
      },
      expectedStatus: 403,
      validate: (data) => data.statusCode === 403,
      description: 'Solo roles ADMIN o KINESIOLOGO pueden emitir evaluaciones SOAP.',
    },
    {
      id: 'SEC-04',
      name: 'Intento de Inyección de campos prohibidos (Mass Assignment / Whitelist)',
      path: '/auth/login',
      method: 'POST',
      headers: {},
      body: {
        email: 'admin@profuncional.cl',
        password: 'admin1234',
        isAdminInjected: true,
        extraForbiddenField: 'malicious_payload',
      },
      expectedStatus: 400,
      validate: (data) => data.statusCode === 400,
      description: 'ValidationPipe con forbidNonWhitelisted rechaza campos no autorizados.',
    },
    {
      id: 'SEC-05',
      name: 'Acceso autorizado de Staff con privilegios válidos',
      path: '/schedule/grid?date=2026-11-02',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminAuth.token}` },
      expectedStatus: [200, 201],
      validate: (data) => Array.isArray(data),
      description: 'Staff autenticado accede correctamente a la parrilla y alertas médicas.',
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
        signal: AbortSignal.timeout(5000),
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
  const jsonPath = path.join(EVIDENCIAS_DIR, 'resultado-seguridad-rbac.json');
  const mdPath = path.join(EVIDENCIAS_DIR, 'resultado-seguridad-rbac.md');

  const jsonPayload = {
    metadata: {
      generatedAt: timestamp,
      type: 'Pruebas de Seguridad y RBAC',
      apiBase: API_BASE,
      totalTests: tests.length,
      passed: passedCount,
      failed: failedCount,
      successRate: `${((passedCount / tests.length) * 100).toFixed(1)}%`,
    },
    results,
  };
  fs.writeFileSync(jsonPath, JSON.stringify(jsonPayload, null, 2), 'utf-8');

  let mdContent = `# 🛡️ Evidencia Verificable de Pruebas de Seguridad y RBAC — Hito 3 UNAB\n\n`;
  mdContent += `* **Fecha y Hora:** \`${timestamp}\`\n`;
  mdContent += `* **Servidor Objetivo:** \`${API_BASE}\` (NestJS + Guards + Neon PostgreSQL)\n`;
  mdContent += `* **Total de Pruebas:** ${tests.length} | **Aprobadas:** ${passedCount} | **Fallidas:** ${failedCount} (**${((passedCount / tests.length) * 100).toFixed(1)}% Éxito**)\n\n`;
  mdContent += `## Matriz de Casos de Seguridad y Privilegios\n\n`;
  mdContent += `| ID | Caso de Prueba | Esperado | Obtenido | Latencia | Estado |\n`;
  mdContent += `| :--- | :--- | :---: | :---: | :---: | :---: |\n`;
  for (const r of results) {
    const statusIcon = r.passed ? '✅ APROBADA' : '❌ FALLIDA';
    mdContent += `| **${r.id}** | ${r.name} | HTTP ${r.expectedStatus} | HTTP ${r.obtainedStatus} | ${r.durationMs} ms | ${statusIcon} |\n`;
  }
  mdContent += `\n## Detalle Forense de Respuestas HTTP\n\n`;
  for (const r of results) {
    mdContent += `### [${r.id}] ${r.name}\n`;
    mdContent += `- **Endpoint:** \`${r.method} ${r.endpoint}\`\n`;
    mdContent += `- **Evaluación:** ${r.passed ? 'Protección confirmada' : 'Brecha detectada'} (HTTP ${r.obtainedStatus})\n`;
    mdContent += `- **Respuesta del Servidor:**\n`;
    mdContent += `\`\`\`json\n${JSON.stringify(r.responseSummary, null, 2)}\n\`\`\`\n\n`;
  }
  fs.writeFileSync(mdPath, mdContent, 'utf-8');

  console.log(`${COLORS.bold}${COLORS.cyan}========================================================================${COLORS.reset}`);
  console.log(`${COLORS.bold}📊 RESUMEN FINAL DE PRUEBAS DE SEGURIDAD${COLORS.reset}`);
  console.log(`   Total de pruebas ejecutadas: ${tests.length}`);
  console.log(`   ${COLORS.green}Pruebas Aprobadas:          ${passedCount}${COLORS.reset}`);
  console.log(`   ${failedCount > 0 ? COLORS.red : COLORS.dim}Pruebas Fallidas:           ${failedCount}${COLORS.reset}`);
  console.log(`   Tasa de Éxito de Seguridad: ${((passedCount / tests.length) * 100).toFixed(1)}%`);
  console.log(`${COLORS.bold}${COLORS.cyan}------------------------------------------------------------------------${COLORS.reset}`);
  console.log(`${COLORS.green}💾 Evidencias guardadas en:${COLORS.reset}`);
  console.log(`   📄 Markdown: ${COLORS.cyan}evidencias/resultado-seguridad-rbac.md${COLORS.reset}`);
  console.log(`   📦 JSON:     ${COLORS.cyan}evidencias/resultado-seguridad-rbac.json${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}========================================================================\n${COLORS.reset}`);
}

runSecurityTests();
