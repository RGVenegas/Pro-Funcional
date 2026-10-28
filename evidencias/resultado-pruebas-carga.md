# 🚀 Evidencia Verificable de Pruebas No Funcionales (Carga y Rendimiento) — Hito 3 UNAB

* **Fecha y Hora de Benchmark:** `2026-10-27T22:54:51.625Z`
* **Servidor Objetivo:** `http://localhost:3001/api/schedule/blocks?onlyActive=true` (NestJS + PostgreSQL Neon)
* **Concurrencia:** **50 Usuarios Virtuales (VUs)** *(Justificación: 166% del aforo físico de Pro-Funcional)*
* **Total de Peticiones:** 1000 peticiones en 17.48 segundos
* **Evaluación Rúbrica:** **⚠️ Nivel 3 - Bueno**

## 1. Métricas de Rendimiento y Throughput (PNF-01)

| Parámetro | Valor Obtenido | Umbral de Aceptación | Estado |
| :--- | :---: | :---: | :---: |
| **Throughput** | **57.2 req/seg** | > 100 req/s | ⚠️ Brecha |
| **Solicitudes Exitosas** | 1000 | 100% ideal | ✅ |
| **Solicitudes Fallidas** | 0 | Tasa < 1.0% | ✅ Aceptado |
| **Tasa de Error** | **0.00%** | < 1.0% | ✅ Aceptado |

## 2. Distribución de Latencia y Percentiles (PNF-01 / PNF-02)

| Percentil | Latencia (ms) | Criterio de Calidad |
| :--- | :---: | :--- |
| **Mínima** | 356.5 ms | Tiempo óptimo de red/DB |
| **Mediana (p50)** | **855.1 ms** | Umbral < 80 ms (Experiencia típica) |
| **Percentil 90 (p90)** | 904.8 ms | Comportamiento del 90% de usuarios |
| **Percentil 95 (p95)** | **967.1 ms** | **Umbral Rúbrica < 250 ms (Crítico)** |
| **Percentil 99 (p99)** | 1058.6 ms | Peor escenario de cola |
| **Máxima** | 1161.6 ms | Solicitud más lenta observada |

## 3. Monitoreo de Recursos del Servidor (PNF-03)

| Recurso | Medición en Carga | Umbral Aceptación | Estado |
| :--- | :---: | :---: | :---: |
| **Memoria Heap Usada** | 11.1 MB | < 180 MB | ✅ Normal |
| **Memoria RSS Total** | 68.3 MB | < 250 MB | ✅ Normal |
| **Uso Medio de CPU** | 5.1% | < 40% núcleo | ✅ Normal |
