# Guion oral · Presentación EP4 (~8 minutos)

**Orden:** Camilo Romero → Alison Aranda → Macarena Muñoz  
**Material:** `Presentacion_EP4_API_Alumnos.pptx`  
**Ritmo:** ~140 palabras/minuto · total ≈ 8:00  

> Aunque presenten en este orden, **los tres deben saber todo**: en la pauta la defensa puede evaluarse de forma individual y el docente puede preguntarle a cualquiera.

---

## Reloj rápido

| Minuto | Quién | Diapositivas | Tema |
|---|---|---|---|
| 0:00 – 2:40 | **Camilo** | 1 → 5 | Portada, SUT, EP01→EP3, estrategia, tipos |
| 2:40 – 5:20 | **Alison** | 6 → 9 (+ diapo Docker) | Herramientas, ejecución, Docker/Trivy, incidentes |
| 5:20 – 8:00 | **Macarena** | 10 → 13 | Ética, recomendaciones, veredicto, cierre |

---

# BLOQUE 1 — Camilo Romero (~2 min 40 s)

### Diapo 1 — Portada (~20 s)

Buenas. Somos el grupo de **ISY1102**: Camilo Romero, Alison Aranda y Macarena Muñoz.  
Vamos a presentar la verificación de **calidad, seguridad y cumplimiento** sobre la **API de Alumnos**, laboratorio `15-all`.  
Yo abro con el contexto y la estrategia; Alison muestra la ejecución; Macarena cierra con ética, recomendaciones y veredicto.

### Diapo 2 — Índice (~15 s)

El orden será: sistema bajo prueba, cómo pasamos de la EP01 a la EP3, estrategia y tipos de prueba, herramientas, resultados reales, incidentes, y cierre normativo.

### Diapo 3 — El SUT (~40 s)

El software es un **microservicio Spring Boot 3** con Maven y SQLite. Expone el CRUD `/api/v1/alumnos`, con OpenAPI, Swagger y Redoc, y arquitectura limpia: dominio, aplicación e infraestructura.  
El proyecto `15-all` concentra **todas** las tecnologías de calidad y seguridad del curso. Además existen módulos `con-error` y `sin-error` para contrastar qué detecta el pipeline.  
Maneja datos de alumnos —RUT, nombre, email—, por eso también aplicamos criterios de la **Ley 19.628 / 21.719**.

### Diapo 4 — EP01 → EP3 (~35 s)

En la **EP01** diseñamos el plan de pruebas. En esta evaluación **no partimos de cero**: heredamos estrategia, tipos, criterios y trazabilidad, y los **ejecutamos** sobre el laboratorio de calidad del curso.  
El cambio clave es pasar del diseño a la **evidencia**: análisis estático, pruebas, DAST, contenedor y carga, con incidentes clasificados.

### Diapo 5 — Estrategia y tipos / origen e impacto (~50 s)

Usamos un enfoque **mixto**: automatizado con Maven y revisión manual de reportes. Priorizamos estáticos y unitarias, luego SCA y contenedor, después DAST y rendimiento.  
Para el indicador de tipos de prueba —el de mayor peso— hay que dejar claro **origen e impacto**:

- **SAST**: nace de la deuda y bugs ocultos; si se omite, llegan defectos a producción.  
- **Unitarias + PIT/JaCoCo**: validan el CRUD y la fuerza real de los tests.  
- **BDD Cucumber**: expresa reglas como el RUT único.  
- **Snyk**: CVE en dependencias Maven.  
- **Docker + Trivy**: origen = desplegar seguro; impacto si se omite = imagen con CVE del SO o correr como root.  
- **ZAP**: mira la app en runtime —cabeceras, XSS, clickjacking—.  
- **Gatling/JMeter**: confirman el SLA bajo carga.

Le paso a Alison con las herramientas y la ejecución.

---

# BLOQUE 2 — Alison Aranda (~2 min 40 s)

### Diapo 6 — Herramientas (~35 s)

Gracias, Camilo. El pipeline va del **01 al 14**: Spotless, Checkstyle, PMD y SpotBugs para calidad de código; JUnit, PIT y JaCoCo para pruebas y cobertura; Sonar y Snyk para gate y CVE; Cucumber para BDD; **Docker con Trivy** para empaquetar y escanear la imagen; OWASP ZAP para DAST; y Gatling más JMeter para carga.  
Cada herramienta cubre un riesgo distinto: no es “usar muchas tools”, es **cerrar huecos** del ciclo.

### Diapo 7 — Ejecución real (~70 s)

Ejecutamos en Windows con **JDK 21**. Resultados:

- `mvn clean verify`: **BUILD SUCCESS**, **46 tests**, cero fallos.  
- **JaCoCo** cumplió los checks; **PIT** mató **el 94 %** de las mutaciones —sobre el umbral del 80 %—.  
- Funcional: crear alumno **201**, RUT duplicado **409**, eliminar **204** y consultar de nuevo **404**.  
- **Docker:** construimos la imagen `alumnos-api:1.0.0` sobre **JRE 21 Alpine**, usuario **no-root**. La levantamos y el smoke test a `/api/v1/alumnos` respondió **200**.  
- **Trivy** sobre esa imagen: **0** vulnerabilidades CRITICAL/HIGH en paquetes del SO.  
- **Gatling**: 10 OK, media **12 ms** · **JMeter**: 10 OK, **0** errores · **ZAP**: **FAIL 0**.

Evidencia en anexos: `evidencias/docker/` y reportes de ejecución.

### Diapo 8–9 — Incidentes (~55 s)

No todo salió verde a la primera, y eso también lo documentamos.

- **INC-01, moderado:** Spotless falló por finales de línea **CRLF** en Windows. Origen: convención de formato. Impacto: el gate de calidad corta el build. Lo cerramos con `spotless:apply`.  
- **INC-02, grave:** con **Java 24**, Mockito no pudo mockear el use case —16 errores—. Origen: entorno distinto al requisito **JDK 21**. Impacto: no podíamos demostrar el Quality Gate. Instalamos Temurin 21 y la suite quedó en verde.

También contrastamos módulos `con-error` —por ejemplo sin cabeceras o con CVE en imagen— frente a `15-all` ya remediado.  

*(Si usan la diapo “Docker + Trivy” al final del PPT, muévanla justo después de “Ejecución real” y Alison la nombra aquí en 20 s.)*  

Le paso a Macarena con ética, recomendaciones y cierre.

---

# BLOQUE 3 — Macarena Muñoz (~2 min 40 s)

### Diapo 10 — Ética y normativa (~70 s)

Gracias, Alison. Como el sistema trata datos de alumnos, aplicamos principios éticos: **confidencialidad** con datos de prueba; **veracidad** al reportar Spotless y el fallo de Java 24; **divulgación responsable** y **no maleficencia** —escaneos solo en QA local—; y **mejora continua** con remediaciones priorizadas.

En lo normativo:

- **Ley 19.628 / 21.719**: protección de datos personales.  
- **Ley 21.663**: marco de ciberseguridad —controles SCA, DAST, imagen y cabeceras—.  
- **OWASP e ISO 25010 / 27001 / 29119**: calidad, seguridad y proceso de pruebas con evidencia auditable.

Un hallazgo sin norma queda incompleto; por eso cada incidente se vincula a impacto técnico **y** legal.

### Diapo 11 — Recomendaciones (~45 s)

Proponemos:

1. Mantener **JDK 21** fijo en equipo y CI.  
2. Usar `.gitattributes` con `eol=lf` y Spotless en pre-commit.  
3. Completar **SonarQube** y **Snyk** con tokens del grupo.  
4. Si la API se expone fuera del lab, agregar **autenticación**.  
5. Seguir actualizando Spring Boot ante CVE transitivas documentadas en `.snyk`.

### Diapo 12–13 — Veredicto y cierre (~45 s)

**Veredicto:** con JDK 21, la API Alumnos `15-all` cumple los criterios de calidad, seguridad dinámica y rendimiento del laboratorio. Pasamos de diseñar el plan en la EP01 a **ejecutar con evidencia**.  
Riesgos residuales: falta de autenticación API y CVE transitivas aceptadas en `.snyk`.

Somos Alison, Camilo y Macarena. Quedamos atentos a sus preguntas. Gracias.

---

## Frases de traspaso (para que suene natural)

- Camilo → Alison: *“Con eso cerrado el enfoque, Alison muestra las herramientas y lo que obtuvimos al ejecutar.”*  
- Alison → Macarena: *“Con la evidencia y los incidentes sobre la mesa, Macarena cierra con ética, normas y el veredicto.”*

---

## Si se atrasan (versión de emergencia · recortar)

| Quién | Qué puede acortar |
|---|---|
| Camilo | Índice + detalle de arquitectura; dejar solo 3 tipos de prueba |
| Alison | Lista larga de tools; citar “pipeline 01–14” y saltar a números |
| Macarena | Acortar recomendaciones a las 3 primeras |

---

## Preguntas probables (cualquiera responde)

1. ¿Por qué no bastaba el frontend o solo Postman? → Hay que probar backend, estáticos, DAST y carga.  
2. ¿Origen e impacto del INC-02? → JDK 24 vs 21; bloqueó Mockito y el gate.  
3. ¿SAST vs DAST? → Código vs app corriendo (ZAP).  
4. ¿Qué ley aplica a RUT/email? → 19.628 / 21.719.  
5. ¿100 % JaCoCo es calidad total? → No; la fuerza se mide con PIT (94 %).  
6. **¿Qué hicieron con Docker?** → Imagen `alumnos-api:1.0.0` (JRE 21 Alpine, user no-root); `docker run` smoke 200; **Trivy** 0 CRITICAL/HIGH OS. El multi-stage original falló por Spotless CRLF/LF Windows↔Linux; se documentó y se usó build runtime con JAR ya validado.  
7. **¿Snyk vs Trivy?** → Snyk mira dependencias del `pom.xml`; Trivy mira paquetes del sistema operativo de la imagen.

Ensayen una vez con cronómetro. Objetivo: **terminar entre 7:30 y 8:15**.

---

## Mini-ficha Docker (para memorizar · Alison)

| Qué | Detalle |
|---|---|
| Imagen | `alumnos-api:1.0.0` |
| Base | `eclipse-temurin:21-jre-alpine` |
| Seguridad | Usuario `app` (no-root) · Alpine mínima |
| Escaneo | Trivy OS · severity CRITICAL,HIGH → **0 hallazgos** |
| Prueba | Contenedor en 8081 · GET `/api/v1/alumnos` → **200** |
| Evidencia | `trabajo-grupo/evidencias/docker/` |
