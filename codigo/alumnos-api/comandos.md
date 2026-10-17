# Comandos — 15-all (todas las tecnologías, todo OK)

`15-all` es el **proyecto final**: tiene **todas las tecnologías aplicadas y en verde**.
No hay `con-error`: es el estado "todo ok" que resulta de aplicar las correcciones de
los módulos **01–14**.

> Requisitos: Java 21, Maven 3.9+, Docker (para SonarQube, Trivy y ZAP) y la CLI de
> Snyk (`npm i -g snyk` o binario).

---

## Tabla: tecnología → comando → reporte

| # | Tecnología | Comando | Reporte / acceso |
| --- | --- | --- | --- |
| 01 | Spotless | `./mvnw spotless:check` | consola (sin archivo) |
| 02 | Checkstyle | `./mvnw checkstyle:check` | `target/checkstyle-result.xml` |
| 03 | PMD | `./mvnw pmd:check` | `target/site/pmd.html` · `target/pmd.xml` |
| 04 | SpotBugs | `./mvnw compile spotbugs:check` | `target/spotbugsXml.xml` |
| 05 | JUnit + Mockito | `./mvnw test` | `target/surefire-reports/` |
| 06 | PIT (mutación) | `./mvnw test-compile org.pitest:pitest-maven:mutationCoverage` | `target/pit-reports/index.html` |
| 07 | JaCoCo (cobertura) | `./mvnw verify` | `target/site/jacoco/index.html` |
| 08 | SonarQube | `docker compose up -d` + `./mvnw verify sonar:sonar -Dsonar.token=TU_TOKEN` | <http://localhost:9000> |
| 09 | Snyk | `snyk test --severity-threshold=critical` | consola (`--json` / `--sarif` opcional) |
| 10 | Cucumber (BDD) | `./mvnw test -Dtest=CucumberRunnerTest` | `target/surefire-reports/` |
| 11 | Docker + Trivy | `docker build ...` + `trivy image ...` | `trivy-report.html` (con `--format template --template "@/contrib/html.tpl"`) |
| 12 | OWASP ZAP | app levantada + `zap-baseline.py ...` | `report.html` · `report.json` · `report.md` |
| 13 | Gatling | app levantada + `./mvnw gatling:test` | `target/gatling/<simulación>/index.html` |
| 14 | JMeter | app levantada + `./mvnw -Pjmeter verify` | `target/jmeter/results/*.csv` |

---

## Pasar por TODAS las tecnologías

### A) Calidad de código + pruebas + mutación + cobertura (no necesita la app)

Un solo comando corre **01 → 07**:

```bash
./mvnw clean verify
```

Ejecuta en orden: **Spotless → Checkstyle → PMD → SpotBugs → JUnit → PIT → JaCoCo**.
Reportes que quedan en `target/`:

| Reporte | Archivo |
| --- | --- |
| Code smells (PMD) | `target/site/pmd.html` |
| Bugs (SpotBugs) | `target/spotbugsXml.xml` |
| Pruebas (JUnit) | `target/surefire-reports/` |
| Mutación (PIT) | `target/pit-reports/index.html` |
| Cobertura (JaCoCo) | `target/site/jacoco/index.html` |

### B) Herramientas que necesitan la aplicación levantada (10, 12, 13, 14)

Terminal 1 — levantar la app:

```bash
./mvnw spring-boot:run
```

Terminal 2 — ejecutar cada tecnología:

```bash
# 10 - Cucumber (BDD)
./mvnw test -Dtest=CucumberRunnerTest

# 12 - OWASP ZAP (DAST)
docker run --rm --network host -v "$PWD":/zap/wrk/:rw \
  ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
  -t http://localhost:8080 -i -c .zap/rules.tsv

# 13 - Gatling (carga)
./mvnw gatling:test

# 14 - JMeter (carga)
./mvnw -Pjmeter verify
```

### C) Contenedor (11 — Docker + Trivy)

> ⚠️ **Primero construye la imagen.** Trivy la busca por su tag; si no existe, falla
> con `No such image: alumnos-api:1.0.0`. Ejecuta los comandos desde la carpeta
> `15-all/`.

```bash
# 1) Construir la imagen
docker build -t alumnos-api:1.0.0 .

# 2) Escanear (falla si hay CVEs CRITICAL/HIGH en el SO)
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image --scanners vuln --pkg-types os \
  --severity CRITICAL,HIGH --exit-code 1 alumnos-api:1.0.0
```

Para generar el reporte HTML de Trivy (con la imagen ya construida):

```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v "$PWD":/out \
  aquasec/trivy image --scanners vuln --pkg-types os \
  --format template --template "@/contrib/html.tpl" \
  --output /out/trivy-report.html alumnos-api:1.0.0
```

### D) SonarQube (08)

```bash
docker compose up -d      # SonarQube en http://localhost:9000  (admin / admin)
# esperar ~1-2 min a que responda, luego:
./mvnw verify sonar:sonar -Dsonar.token=TU_TOKEN
```

### E) Snyk (09)

```bash
snyk auth                 # una vez
snyk test --severity-threshold=critical
```

---

## Resumen de reportes (dónde verlos)

| Reporte | Archivo / URL |
| --- | --- |
| Code smells (PMD) | `target/site/pmd.html` |
| Convenciones (Checkstyle) | `target/checkstyle-result.xml` |
| Bugs (SpotBugs) | `target/spotbugsXml.xml` |
| Pruebas (JUnit / Cucumber) | `target/surefire-reports/` |
| Mutación (PIT) | `target/pit-reports/index.html` |
| Cobertura (JaCoCo) | `target/site/jacoco/index.html` |
| Calidad global (SonarQube) | <http://localhost:9000> |
| Vulnerabilidades de la imagen (Trivy) | `trivy-report.html` |
| DAST (ZAP) | `report.html` · `report.json` · `report.md` |
| Carga (Gatling) | `target/gatling/<simulación>/index.html` |
| Carga (JMeter) | `target/jmeter/results/*.csv` |
