# EV2 — Evaluación Parcial N.º 2 (ISY1102)

Entregables de la **Evaluación Parcial N.º 2** de *Seguridad y Calidad en el Desarrollo de Software*.

**Alison Aranda · Macarena Muñoz · Camilo Romero**  
Sección ISY1102 · Docente: Mauricio Velásquez

El caso de la EP01 es **Atlas** (gestión de clientes y contratos). El software que este repositorio deja listo para clonar y ejecutar es el laboratorio de calidad **API de Alumnos** (`codigo/alumnos-api`): Spring Boot 3, Maven y SQLite, con el pipeline de pruebas dentro de Docker.

---

## 1. Qué se entrega

| Carpeta / archivo | Contenido |
| --- | --- |
| `docs/01_Informe_EP02.md` | Informe técnico (fuente en Markdown). |
| `docs/02_Presentacion_EP02.md` | Guion de la defensa. |
| `docs/02b_Guion_Oral_8min.md` | Guion oral: Camilo, Alison y Macarena. |
| `docs/03_Guia_de_Estudio.md` | Conceptos, herramientas y preguntas. |
| `docs/04_Paso_a_Paso.md` | Cómo se construyó la evaluación. |
| `entrega/` | Informe Word/PDF y presentación PPTX. |
| `codigo/alumnos-api/` | Software y `Dockerfile` (app + suite de pruebas). |
| `evidencias/` | Logs y reportes de la ejecución (verify, ZAP, Gatling, JMeter, Trivy, Docker). |
| `docker-compose.yml` | Levanta la API o corre las pruebas en cualquier equipo. |

---

## 2. Resultado de la ejecución

| Verificación | Resultado |
| --- | --- |
| `mvn verify` con JDK 21 | BUILD SUCCESS · 46 tests · 0 fallos |
| JaCoCo | Umbral de cobertura cumplido |
| PIT | 16/17 mutaciones eliminadas (94 %) |
| API | POST 201 · RUT duplicado 409 · DELETE 204 · GET 404 |
| Docker + Trivy (OS, CRITICAL/HIGH) | 0 hallazgos · smoke HTTP 200 |
| OWASP ZAP baseline | FAIL: 0 |
| Gatling | 10 OK · media 12 ms |
| JMeter | 10 OK · 0 errores |

Incidentes de entorno, ya cerrados: Spotless por CRLF en Windows, y Mockito incompatible con Java 24 (el contenedor usa Java 21).

---

## 3. Arranque rápido

Requisito único: **Docker Desktop** (o Docker Engine). No hace falta instalar Java en el equipo.

```bash
docker compose up -d --build api
```

| Recurso | URL |
| --- | --- |
| API | http://localhost:8080/api/v1/alumnos |
| Swagger | http://localhost:8080/swagger-ui.html |
| Home | http://localhost:8080/ |

Suite de calidad y pruebas (Spotless, Checkstyle, PMD, SpotBugs, JUnit, Cucumber, JaCoCo y PIT):

```bash
docker compose --profile pruebas run --rm --build pruebas
```

Detener la API:

```bash
docker compose down
```

---

## 4. Arquitectura del software en `codigo/`

```
codigo/alumnos-api
├── src/main/java/cl/duoc/alumnos
│   ├── domain
│   ├── application
│   └── infrastructure
├── src/test
├── Dockerfile          etapas build, pruebas y runtime
└── pom.xml
```

El flujo de dependencias apunta hacia el dominio. La imagen de runtime usa JRE 21 Alpine y un usuario sin privilegios de root.

---

## 5. Evidencia

Los reportes generados en la ejecución local están en `evidencias/`:

| Carpeta | Qué contiene |
| --- | --- |
| `evidencias/analisis-estatico/` | Log de `mvn verify`, JaCoCo, PIT, PMD, SpotBugs |
| `evidencias/ejecucion/` | API, ZAP, Gatling y JMeter |
| `evidencias/docker/` | Build, smoke test y Trivy |
| `evidencias/capturas/` | Figuras insertadas en el informe |

---

## 6. Entrega a AVA

Subir el archivo de `entrega/` (Word o PDF) y la presentación. Formato del informe: Arial 12 en títulos, Arial 11 en cuerpo, interlineado 1,5 y texto justificado.

---

ISY1102 · Alison Aranda · Macarena Muñoz · Camilo Romero · octubre de 2026
