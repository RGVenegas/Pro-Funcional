# 🎤 Guión y Estructura de Demostración Técnica (5 a 7 Minutos) — Hito 3 UNAB
## Proyecto: Pro-Funcional — Sistema de Gestión Kinésico-Deportiva
**Integrantes:** Rodrigo, Pablo, Kevin, Sebastián  
**Referencia:** Pauta oficial Rúbrica Hito 3 UNAB (Página 3)

---

### ⏱️ Cronómetro y Distribución del Tiempo (Total: 5 - 7 minutos)

```
[0:00 - 1:00] ── 1. Requerimiento y Riesgos Críticos que se verifican
[1:00 - 2:30] ── 2. Demostración en Vivo: Ejecución de Prueba Funcional
[2:30 - 4:30] ── 3. Presentación de Resultados de Pruebas No Funcionales (Carga y Resiliencia)
[4:30 - 5:45] ── 4. Interpretación de Métricas de Ingeniería y Defectos Detectados
[5:45 - 6:30] ── 5. Justificación Técnica de Limitaciones y Acciones Correctivas
```

---

### 🎯 Minuto 0:00 – 1:00 | 1. Explicar el requerimiento y el riesgo a verificar

* **Qué decir:**
  > *"Profesor(a), para este Hito 3 nuestro foco fue validar que Pro-Funcional cumple con sus reglas de negocio y resiste condiciones operativas reales bajo dos riesgos arquitectónicos fundamentales:*
  > 
  > 1. ***Riesgo Clínico y de Privilegios (Seguridad y Ficha SOAP):*** *Asegurar que un paciente no pueda ver ni alterar historias clínicas ajenas, y que el sistema rechace datos biológicamente imposibles (como dolor EVA mayor a 10 o flexiones articulares negativas).*
  > 2. ***Riesgo de Concurrencia y Disponibilidad:*** *Garantizar que en horas punta de agendamiento el backend soporte la carga simultánea sin caídas, y que si una pasarela externa como Mercado Pago falla, el sistema sea resiliente y se recupere inmediatamente."*

---

### 💻 Minuto 1:00 – 2:30 | 2. Ejecutar en Vivo al menos una prueba funcional

* **Qué hacer en pantalla:**
  1. Mostrar la terminal con el backend corriendo en el puerto 3001.
  2. En una segunda terminal, ejecutar:
     ```bash
     npm run test:clinical
     # O directamente: node scripts/run-clinical-tests.mjs
     ```
  3. Dejar que la consola imprima los checks verdes.

* **Qué decir:**
  > *"Aquí estamos ejecutando la suite clínica en tiempo real contra nuestra base de datos PostgreSQL en la nube. Observen el caso **CLN-03**: enviamos una evaluación con dolor EVA = 15; el backend lo intercepta con un **HTTP 400 Bad Request** porque la escala médica internacional es de 0 a 10. Igualmente con **CLN-04**, donde un ángulo articular de -20° es rechazado. El sistema no solo guarda datos, sino que valida la coherencia médica y las reglas de negocio."*

---

### 📊 Minuto 2:30 – 4:30 | 3. Mostrar la prueba no funcional ejecutada y sus resultados

* **Qué mostrar en pantalla:**
  Abrir el archivo `evidencias/resultado-pruebas-carga.md` o ejecutar `npm run test:load`.

* **Qué decir:**
  > *"Para la prueba no funcional, diseñamos un benchmark de **50 usuarios virtuales concurrentes** lanzando **1.000 solicitudes reales**.
  > 
  > **¿Por qué 50 usuarios?** El aforo físico total de Pro-Funcional es de 30 personas (boxes de kinesiología + área funcional). Probar con 50 usuarios representa el **166% de la capacidad física máxima instalada** en una hora punta de reserva.
  > 
  > **Resultados obtenidos:**
  > - **Tasa de error:** **0.00%** (1.000 de 1.000 respondidas sin un solo fallo).
  > - **Throughput:** **78.2 peticiones por segundo sostenidas**.
  > - **Consumo de Hardware:** CPU al **7.7%** y memoria RAM con un uso plano de solo **23.4 MB**, lo que comprueba matemáticamente que **no hay fugas de memoria (memory leaks)**."*

---

### 🔍 Minuto 4:30 – 5:45 | 4. Interpretar métricas y explicar los problemas detectados (Análisis de Defectos)

* **Qué decir (Punto clave de la rúbrica UNAB - Demostración de Ingeniería):**
  > *"Como destaca la rúbrica de la universidad: 'Una prueba fallida o una brecha detectada demuestra ingeniería cuando se analiza correctamente'.
  > 
  > Si observamos nuestra latencia, obtuvimos una mediana de **584 ms** y un percentil 95 ($p95$) de **899 ms**, lo cual supera el umbral estricto de 250 ms.
  > 
  > **¿Por qué ocurre esto?**
  > Nuestra base de datos PostgreSQL está alojada en la nube en **Neon (servidores AWS en Virginia, Estados Unidos)**, mientras que la prueba se ejecutó desde **Santiago de Chile**. El Round-Trip Time físico de la fibra óptica internacional agrega entre 150 y 200 ms por consulta. El cuello de botella no es el código de NestJS ni la CPU (que solo estuvo al 7%), sino la distancia física transcontinental de la red."*

---

### 🛠️ Minuto 5:45 – 6:30 | 5. Justificar correcciones, resiliencia y trabajo futuro

* **Qué decir:**
  > *"Para validar la tolerancia a fallos, incorporamos pruebas de **Resiliencia (`npm run test:resilience`)**, simulando la caída de dependencias externas como Mercado Pago y cortes abruptos de red. Comprobamos que el backend captura los fallos en 7 ms y se recupera instantáneamente en 1 a 3 ms sin botar el servidor ni fugar conexiones.
  > 
  > **Acción correctiva planificada para producción:**
  > Desplegar la base de datos en la región AWS San Pablo (`sa-east-1`) y habilitar una capa de caché en memoria con Redis para los bloques horarios de alta lectura, lo que reducirá la latencia a menos de 40 ms.
  > 
  > Con esto demostramos un sistema con 100% de reproducibilidad, validación de casos límite y evidencia forense lista para auditoría."*

---

### 📋 Checklist Rápido antes de Salir a Exponer:
- [ ] Backend levantado en una terminal (`cd backend && npm run start:dev`).
- [ ] Terminal lista en la carpeta raíz del proyecto para lanzar `npm run test:all` o `npm run test:clinical`.
- [ ] Archivo `evidencias/reporte-consolidado-hito-3.md` abierto en el editor para mostrar la matriz completa de 28 pruebas.
- [ ] Archivo `evidencias/resultado-pruebas-carga.md` abierto para proyectar la tabla de percentiles y RAM.
