# Guía de estudio — API Alumnos (`15-all`) · EP3/EP4

**Integrantes:** Alison Aranda · Macarena Muñoz · Camilo Romero  
**SUT:** Microservicio Spring Boot 3 · Maven · SQLite · CRUD `/api/v1/alumnos`  
**Lab:** `calidad - EJEMPLO/codigo/15-all` (+ módulos 01–14 con/sin error)

---

## 1. Conceptos

| Concepto | Definición | En este lab |
|---|---|---|
| Calidad de código | Cumplir formato y convenciones | Spotless, Checkstyle |
| Análisis estático (SAST) | Revisar código/bytecode sin “usar” la API | PMD, SpotBugs, Sonar |
| Cobertura | % de líneas ejecutadas por tests | JaCoCo 100 % |
| Mutación | ¿Los tests detectan cambios en la lógica? | PIT ≥ 80 % |
| SCA | Vulnerabilidades en dependencias | Snyk |
| DAST | Seguridad con la app corriendo | OWASP ZAP |
| Contenedor seguro | Imagen sin CVE graves de OS | Docker + Trivy |
| BDD | Escenarios en lenguaje de negocio | Cucumber / Gherkin |
| Quality Gate | Criterio automático de “pasa/no pasa” | SonarQube |

## 2. Tecnologías 01–14 (memorizar)

| # | Tool | Qué prueba | ¿App up? |
|---|---|---|---|
| 01 | Spotless | Formato | No |
| 02 | Checkstyle | Convenciones | No |
| 03 | PMD | Smells | No |
| 04 | SpotBugs | Bugs bytecode | No |
| 05 | JUnit+Mockito | Unitarias | No |
| 06 | PIT | Mutación | No |
| 07 | JaCoCo | Cobertura | No |
| 08 | SonarQube | Gate integral | No* |
| 09 | Snyk | CVE deps | No |
| 10 | Cucumber | BDD | No** |
| 11 | Trivy | Imagen | Build Docker |
| 12 | ZAP | DAST cabeceras | Sí |
| 13 | Gatling | Carga SLA | Sí |
| 14 | JMeter | Carga | Sí |

\* Sonar necesita `docker compose` del Sonar. \*\* Cucumber usa gateway in-memory.

## 3. Posibles preguntas (defensa)

1. **¿Por qué `15-all` y no Atlas?** — EP01 diseñó el plan; EP3 ejecuta sobre el laboratorio de calidad del curso que concentra el pipeline completo.  
2. **Diferencia Spotless vs Checkstyle** — Spotless reformatea; Checkstyle solo verifica reglas.  
3. **¿100 % JaCoCo = calidad total?** — No; mide ejecución de líneas. La fuerza se mide con PIT.  
4. **SAST vs DAST** — código vs app en runtime (ZAP).  
5. **¿Qué hace Trivy que no hace Snyk?** — Trivy: OS de la imagen; Snyk: dependencias Maven.  
6. **Cabeceras ZAP** — `X-Content-Type-Options`, `X-Frame-Options`, CSP, etc. via `SecurityHeadersFilter`.  
7. **Origen e impacto de omitir SCA** — CVE conocidas llegan a producción.  
8. **RUT duplicado** — regla de negocio → 409; escenario Cucumber.  
9. **Hallazgo real Windows** — Spotless falló por CRLF→LF; se corrigió con `spotless:apply`.  
10. **Hallazgo Java 24** — Mockito/inline mocks fallan; el README exige Java 21 → incidente de entorno.

## 4. Checklist estudio

- [ ] Explico arquitectura limpia del microservicio  
- [ ] Recito herramientas 01–14 con una frase cada una  
- [ ] Diferencio con-error vs sin-error con 2 ejemplos  
- [ ] Vinculo un hallazgo a Ley 21.663 u OWASP  
- [ ] Explico criticidad de un CVE / falta de cabeceras  
