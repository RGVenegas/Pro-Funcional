/**
 * Script de Ejecución de Pruebas Funcionales Automatizadas — Hito 3 UNAB
 * Proyecto: Pro-Funcional
 * 
 * Ejecuta los casos de prueba funcionales descritos en la Matriz de Pruebas
 * contrastando resultados esperados contra resultados obtenidos.
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

async function checkServerConnection() {
  try {
    const res = await fetch(`${API_BASE}/v1/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function run() {
  console.log(`\n${COLORS.bold}${COLORS.cyan}========================================================================${COLORS.reset}`);
  console.log(`${COLORS.bold}🧪 SUITE DE PRUEBAS FUNCIONALES AUTOMATIZADAS — HITO 3 UNAB${COLORS.reset}`);
  console.log(`${COLORS.dim}Proyecto: Pro-Funcional | Objetivo: Evidencia Verificable y Reproducible${COLORS.reset}`);
  console.log(`${COLORS.dim}Endpoint Base: ${API_BASE}${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}========================================================================\n${COLORS.reset}`);

  const isOnline = await checkServerConnection();

  if (!isOnline) {
    console.log(`${COLORS.red}${COLORS.bold}❌ ERROR: El servidor backend NO está corriendo en ${API_BASE}${COLORS.reset}\n`);
    console.log(`Para ejecutar pruebas reales y verificables, primero debes levantar el backend:`);
    console.log(`   ${COLORS.cyan}1. cd backend${COLORS.reset}`);
    console.log(`   ${COLORS.cyan}2. npm run start:dev${COLORS.reset}\n`);
    console.log(`${COLORS.yellow}⛔ Ejecución cancelada: La rúbrica de Hito 3 exige 'evidencia reproducible y verificable'. No se aceptan simulaciones.${COLORS.reset}\n`);
    process.exit(1);
  }

  const results = [];

  const tests = [
    {
      id: 'PF-01a',
      hu: 'HU-01 / HU-03',
      name: 'Autenticación Staff con credenciales válidas',
      path: '/auth/login',
      method: 'POST',
      body: { email: 'admin@profuncional.cl', password: 'admin1234' },
      expectedStatus: [200, 201],
      validate: (data) => !!data.accessToken && data.user?.role === 'ADMIN',
      description: 'Valida emisión de token JWT y rol ADMIN en base de datos real.',
    },
    {
      id: 'PF-01b',
      hu: 'HU-01 / HU-03',
      name: 'Autenticación con password incorrecto (Caso inválido)',
      path: '/auth/login',
      method: 'POST',
      body: { email: 'admin@profuncional.cl', password: 'wrongpassword' },
      expectedStatus: 401,
      validate: (data) => data.statusCode === 401,
      description: 'Valida rechazo 401 Unauthorized sin fuga de datos.',
    },
    {
      id: 'PF-01c',
      hu: 'HU-03',
      name: 'Autenticación de Paciente (Juan Pérez)',
      path: '/auth/login',
      method: 'POST',
      body: { email: 'juan.perez@gmail.com', password: 'password123' },
      expectedStatus: [200, 201],
      validate: (data) => !!data.accessToken && data.user?.role === 'PATIENT',
      description: 'Valida token para paciente con rol PATIENT.',
    },
    {
      id: 'PF-02',
      hu: 'HU-01',
      name: 'Consulta de bloques horarios activos de agenda',
      path: '/schedule/blocks?onlyActive=true',
      method: 'GET',
      expectedStatus: 200,
      validate: (data) => Array.isArray(data),
      description: 'Verifica disponibilidad de bloques en PostgreSQL para agendamiento.',
    },
    {
      id: 'PF-03',
      hu: 'HU-03 / HU-08',
      name: 'Protección de rutas de Staff ante token ausente (RBAC Guard)',
      path: '/schedule/grid?date=2026-11-02',
      method: 'GET',
      headers: {},
      expectedStatus: 401,
      validate: (data) => data.statusCode === 401,
      description: 'Confirma que sin token no se puede acceder a la parrilla.',
    },
    {
      id: 'PF-04',
      hu: 'HU-05 / HU-06',
      name: 'Health Check del Sistema (ALB / Disponibilidad)',
      path: '/v1/health',
      method: 'GET',
      expectedStatus: 200,
      validate: (data) => data.status === 'ok',
      description: 'Verifica estado operativo general de la API NestJS.',
    },
  ];

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
      const isStatusOk = Array.isArray(test.expectedStatus) ? test.expectedStatus.includes(status) : status === test.expectedStatus;
      passed = isStatusOk && test.validate(data);
    } catch (err) {
      duration = Math.round(performance.now() - startTime);
      passed = false;
      data = { error: err.message };
    }

    if (passed) passedCount++;
    else failedCount++;

    const expectedDisplay = Array.isArray(test.expectedStatus) ? test.expectedStatus.join(' / ') : test.expectedStatus;

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
    console.log(`   ${COLORS.dim}HU:${COLORS.reset} ${test.hu} | ${COLORS.dim}Método:${COLORS.reset} ${test.method} ${test.path}`);
    console.log(`   ${COLORS.dim}Resultado Esperado:${COLORS.reset} HTTP ${expectedDisplay} | ${COLORS.dim}Resultado Obtenido:${COLORS.reset} HTTP ${status} (${duration}ms)`);
    console.log(`   ${COLORS.dim}Estado:${COLORS.reset} ${badge}`);
    console.log(`   ${COLORS.dim}Detalle:${COLORS.reset} ${test.description}\n`);
  }

  // --- PERSISTENCIA AUTOMÁTICA DE RESULTADOS ---
  const EVIDENCIAS_DIR = path.resolve('evidencias');
  if (!fs.existsSync(EVIDENCIAS_DIR)) {
    fs.mkdirSync(EVIDENCIAS_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString();
  const jsonPath = path.join(EVIDENCIAS_DIR, 'resultado-pruebas-funcionales.json');
  const mdPath = path.join(EVIDENCIAS_DIR, 'resultado-pruebas-funcionales.md');

  // 1. Guardar JSON estructurado
  const jsonPayload = {
    metadata: {
      generatedAt: timestamp,
      environment: 'Backend NestJS + PostgreSQL (Neon)',
      apiBase: API_BASE,
      totalTests: tests.length,
      passed: passedCount,
      failed: failedCount,
      successRate: `${((passedCount / tests.length) * 100).toFixed(1)}%`,
    },
    results,
  };
  fs.writeFileSync(jsonPath, JSON.stringify(jsonPayload, null, 2), 'utf-8');

  // 2. Guardar Reporte Markdown
  let mdContent = `# 📋 Evidencia Verificable de Pruebas Funcionales — Hito 3 UNAB\n\n`;
  mdContent += `* **Fecha y Hora de Ejecución:** \`${timestamp}\`\n`;
  mdContent += `* **Entorno:** Backend NestJS en vivo (\`${API_BASE}\`) + PostgreSQL en Neon AWS\n`;
  mdContent += `* **Total de Pruebas:** ${tests.length} | **Aprobadas:** ${passedCount} | **Fallidas:** ${failedCount} (**${((passedCount / tests.length) * 100).toFixed(1)}% Éxito**)\n\n`;
  mdContent += `## Tabla de Resultados por Caso de Prueba\n\n`;
  mdContent += `| ID | Historia (HU) | Nombre de la Prueba | Esperado | Obtenido | Latencia | Estado |\n`;
  mdContent += `| :--- | :--- | :--- | :---: | :---: | :---: | :---: |\n`;
  for (const r of results) {
    const statusIcon = r.passed ? '✅ APROBADA' : '❌ FALLIDA';
    mdContent += `| **${r.id}** | ${r.hu} | ${r.name} | HTTP ${r.expectedStatus} | HTTP ${r.obtainedStatus} | ${r.durationMs} ms | ${statusIcon} |\n`;
  }
  mdContent += `\n## Detalle Técnico de Respuestas (Evidencia Forense)\n\n`;
  for (const r of results) {
    mdContent += `### [${r.id}] ${r.name}\n`;
    mdContent += `- **Endpoint:** \`${r.method} ${r.endpoint}\`\n`;
    mdContent += `- **Resultado:** ${r.passed ? 'Aprobada' : 'Fallida'} (HTTP ${r.obtainedStatus} en ${r.durationMs}ms)\n`;
    mdContent += `- **Payload / Respuesta del Servidor:**\n`;
    mdContent += `\`\`\`json\n${JSON.stringify(r.responseSummary, null, 2)}\n\`\`\`\n\n`;
  }
  fs.writeFileSync(mdPath, mdContent, 'utf-8');

  console.log(`${COLORS.bold}${COLORS.cyan}========================================================================${COLORS.reset}`);
  console.log(`${COLORS.bold}📊 RESUMEN FINAL DE EJECUCIÓN FUNCIONAL${COLORS.reset}`);
  console.log(`   Total de pruebas ejecutadas: ${tests.length}`);
  console.log(`   ${COLORS.green}Pruebas Aprobadas:          ${passedCount}${COLORS.reset}`);
  console.log(`   ${failedCount > 0 ? COLORS.red : COLORS.dim}Pruebas Fallidas:           ${failedCount}${COLORS.reset}`);
  console.log(`   Tasa de Éxito:              ${((passedCount / tests.length) * 100).toFixed(1)}%`);
  console.log(`${COLORS.bold}${COLORS.cyan}------------------------------------------------------------------------${COLORS.reset}`);
  console.log(`${COLORS.green}💾 Evidencias guardadas exitosamente en:${COLORS.reset}`);
  console.log(`   📄 Markdown: ${COLORS.cyan}evidencias/resultado-pruebas-funcionales.md${COLORS.reset}`);
  console.log(`   📦 JSON:     ${COLORS.cyan}evidencias/resultado-pruebas-funcionales.json${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}========================================================================\n${COLORS.reset}`);
}

run();
