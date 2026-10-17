# Evaluación Parcial 2 — Paso a paso (grupo)

**Asignatura:** ISY1102 · Seguridad y Calidad en el Desarrollo de Software  
**Integrantes:** Alison Aranda · Macarena Muñoz · Camilo Romero  
**SUT EP3:** API Alumnos — `calidad - EJEMPLO/codigo/15-all`  
**Docente:** Mauricio Velásquez · EP1 (plan Atlas) en `insumos/`  
**Guías:** `GUIA_DE_ESTUDIO_ALUMNOS.md` · Kit: `herramientas/KIT_EJECUCION_ALUMNOS.md`

## Qué es la “Evaluación 2”

| Pieza | Documento oficial | Peso | Tipo | Entregable |
|---|---|---|---|---|
| Encargo / Informe | **EP3** | **12 %** | Grupal | Word o PDF (formato Arial 12/11, interlineado 1,5) |
| Presentación / Defensa | **EP4** | **28 %** | Individual | PPT/PDF de apoyo + defensa 10 min + 5 min preguntas |

> Total: **40 %** de la nota. La defensa es individual: **los tres** deben dominar todo el proyecto.

---

## Insumos (Paso 0)

Ya cargado:

- [x] Informe **EP01** (`insumos/Informe_EP1_ISY1102.docx`) — Atlas
- [x] Datos de portada (integrantes, docente Mauricio Velásquez)

Aún falta (bloquea evidencia real de §§5–6):

- [ ] **Feedback** puntual del docente de la EP01 (si existe)
- [ ] **ERS** oficial de Atlas (PDF)
- [ ] **Código fuente** + **Docker** de Atlas
- [ ] Fecha de entrega EP3/EP4

**Ya avanzado sin Docker:**
- [x] Borrador EP3 con datos de la EP1 (Atlas)
- [x] 14 casos de prueba + matriz de cobertura ampliada
- [x] Kit de ejecución + colección Postman (`herramientas/`)
- [x] Guía de estudio para la defensa
- [x] Secciones 7–8 con análisis ético-normativo listo (ajustar con hallazgos reales)

> El ejemplo `casoC-ep02 - EJEMPLO/` sirve por **estructura**, pero el contenido debe ser **Atlas**, no InvenSys.

---

## Orden de trabajo (8 pasos)

### Paso 1 — Ajustes EP01 → EP02/EP3 (sección 1.7)
Tabla: “qué dijo el docente” → “qué se cambió”.  
Si no hubo feedback formal: documentar mejoras propias.

### Paso 2 — Reforzar el plan (sección 3)
Tabla de tipos de prueba con: **origen · objetivo · justificación · impacto · requerimientos · herramienta**.  
Esto alimenta **IE3 (38 %)** del encargo.

### Paso 3 — Casos de prueba (sección 4)
Mínimo **5** casos (el ejemplo tiene 17+). Cada uno con:
ID, descripción, requerimiento ERS, datos, resultado esperado, criterios, **tipo de prueba**.  
Cobertura **100 %** del ERS + matriz bidireccional.

### Paso 4 — Análisis estático (sección 5) — IL 2.3 / IE6
Ejecutar SAST según stack (ej. ESLint + SonarQube + `npm audit`, o SpotBugs/PMD/Trivy del ejemplo Java).  
Registrar: archivo, herramienta, severidad, norma afectada, remediación.  
Contrastar con revisión manual.

### Paso 5 — Ejecutar y evidenciar (sección 6 + anexos)
1. `docker compose up`  
2. Ejecutar casos (Postman, ZAP, JMeter, Cypress u equivalentes)  
3. Por caso: **resultado · captura · fecha · ejecutor**  
4. Guardar en `evidencias/` con nomenclatura clara  

**No maquillar resultados:** un defecto bien documentado vale más que “todo OK” sin evidencia.

### Paso 6 — Incidentes, ética, mejoras (secciones 6.3, 7, 8)
Escala: **CRÍTICO / GRAVE / MODERADO / LEVE**.  
Ética: confidencialidad, veracidad, divulgación responsable, no maleficencia, objetividad.  
Normativa: Ley 19.628 / 21.719, 21.663, 20.422, OWASP, ISO 25010/27001/29119.

### Paso 7 — Presentación EP4 (~14 diapositivas)
Ver `presentacion/Guion_Presentacion.md`.  
Peso crítico: **IE4 (38 %)** = origen e impacto de cada tipo/defecto.

### Paso 8 — Autoevaluación y subida a AVA
Archivo directo a AVA (no enlace Drive). Portada completa. Capturas legibles.

---

## Reparto sugerido del grupo

| Integrante | Foco principal | También debe dominar |
|---|---|---|
| **Macarena Muñoz** | Plan + tipos de prueba + matriz de trazabilidad | Ejecución e incidentes |
| **Alison Aranda** | Casos de prueba + ejecución + evidencias | Análisis estático |
| **Camilo Romero** | Análisis estático + ética/normativa + mejoras | Estrategia y herramientas |

> En la defensa cualquiera puede salir primero: practiquen cruzado.

---

## Rúbricas (lo que más pesa)

**Encargo EP3:** IE3 tipos de prueba **38 %** · IE1 importancia **20 %** · IE5 no funcionales **15 %** · IE7 plan **15 %** · IE9 cobertura **12 %**  

**Presentación EP4:** IE4 origen/impacto **38 %** · IE2 estrategia **20 %** · IE6 estático vs norma **15 %** · IE8 ejecución/trazabilidad **15 %** · IE10 recomendaciones **12 %**  

---

## Referencias en esta carpeta

| Ruta | Uso |
|---|---|
| `../casoC-ep02 - EJEMPLO/paso-a-paso/` | Guía detallada del ejemplo |
| `../casoC-ep02 - EJEMPLO/entrega/` | Informe modelo 100 % |
| `../casoC-ep02 - EJEMPLO/presentacion/` | Guion de diapositivas |
| `../casoC-ep02 - EJEMPLO/herramientas/` | Cómo usar Docker, Postman, ZAP, JMeter, etc. |
| `../calidad - EJEMPLO/codigo/` | Demos de herramientas de calidad (Java) |
| `entrega/Informe_EP3_BORRADOR.md` | Borrador del grupo (empezar aquí) |
| `presentacion/Guion_Presentacion.md` | Guion EP4 del grupo |
