# Pipeline de GitHub Actions — 15-all

Este documento explica **cómo se armó el pipeline de CI/CD** del proyecto
`15-all` (API de Alumnos) y **los pasos que debes seguir** para dejarlo
funcionando en GitHub.

El pipeline vive en:

```
15-all/.github/workflows/calidad-codigo.yml
```

y recorre **las 14 tecnologías del curso** (01–14), cada una como un *job*
independiente y encadenado: si un job falla, los siguientes no se ejecutan.

---

## 1. Detalle

|  |  |  |
| - | - | - |

> Todos los comandos Maven del pipeline fueron **verificados localmente**
> (Java 21 + Maven 3.9.9). En particular se comprobó que la reducción de
> redundancia funciona y que JMeter necesita el formato `goal@executionId`.

---

## 2. Estructura del repositorio (crítico)

GitHub Actions **solo** ejecuta los workflows que están en
`.github/workflows/` **en la raíz del repositorio**. Para que funcione, el
repositorio debe tener esta forma:

```
<repo>/
├── .github/
│   └── workflows/
│       └── calidad-codigo.yml   <-- el pipeline
├── pom.xml
├── mvnw
├── mvnw.cmd
├── .mvn/
├── src/
├── Dockerfile
├── docker-compose.yml
└── ...
```

Es decir, **la raíz del repo es la carpeta `15-all/`**.

Si subes la carpeta `calidad/` completa (con `codigo/01-…`, `codigo/15-all`,
etc.), el workflow no se verá. En ese caso aplica la variante de la
sección 7.

---

## 3. Cómo funciona el pipeline (flujo de jobs)

Los jobs están encadenados con `needs`, en este orden:

```
spotless → checkstyle → pmd → spotbugs → test → mutation → jacoco
        → sonarqube → snyk → cucumber → container → dast
        → performance (Gatling) → performance-jmeter
```

| Orden | Job                    | Tecnología         | Comando                                                                                                         | Reporte / acceso                 |
| ----- | ---------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| 1     | `spotless`           | Spotless (formato)  | `./mvnw spotless:check`                                                                                       | consola                          |
| 2     | `checkstyle`         | Checkstyle          | `./mvnw checkstyle:check`                                                                                     | `target/checkstyle-result.xml` |
| 3     | `pmd`                | PMD (code smells)   | `./mvnw pmd:check`                                                                                            | `target/site/pmd.html`         |
| 4     | `spotbugs`           | SpotBugs (bytecode) | `./mvnw compile spotbugs:check`                                                                               | `target/spotbugsXml.xml`       |
| 5     | `test`               | JUnit + Mockito     | `./mvnw test`                                                                                                 | `target/surefire-reports/`     |
| 6     | `mutation`           | PIT (mutación)     | `./mvnw test-compile org.pitest:pitest-maven:mutationCoverage`                                                | `target/pit-reports/`          |
| 7     | `jacoco`             | JaCoCo (cobertura)  | `./mvnw test jacoco:report jacoco:check`                                                                      | `target/site/jacoco/`          |
| 8     | `sonarqube`          | SonarQube           | `./mvnw test jacoco:report sonar:sonar`                                                                       | servidor Sonar                   |
| 9     | `snyk`               | Snyk                | `snyk test --severity-threshold=critical`                                                                     | consola                          |
| 10    | `cucumber`           | Cucumber (BDD)      | `./mvnw test -Dtest=CucumberRunnerTest`                                                                       | `target/surefire-reports/`     |
| 11    | `container`          | Docker + Trivy      | `docker build` + `trivy-action`                                                                             | imagen + Trivy                   |
| 12    | `dast`               | OWASP ZAP           | app +`zaproxy/action-baseline`                                                                                | reporte ZAP                      |
| 13    | `performance`        | Gatling             | app +`./mvnw gatling:test`                                                                                    | `target/gatling/`              |
| 14    | `performance-jmeter` | JMeter              | app +`-Pjmeter jmeter:configure@configuration jmeter:jmeter@jmeter-tests jmeter:results@jmeter-check-results` | `target/jmeter/results/`       |

Los jobs **3, 4, 5, 6, 7, 13 y 14 suben sus reportes como artefactos**, que se
descargan desde la página de la ejecución del workflow en GitHub.

### Disparadores

- `push` a la rama `main`.
- Cualquier `pull_request`.
- `workflow_dispatch` (botón **Run workflow** en la pestaña Actions, para
  lanzarlo a mano).

Además hay `concurrency` (cancela ejecuciones anteriores del mismo ref) y
`permissions: contents: read` (permisos mínimos).

---

## 4. Secretos necesarios (opcionales pero recomendados)

El pipeline **funciona sin secretos**: los pasos de SonarQube y Snyk se
omiten con una advertencia. Para activarlos, agrégalos en:

> Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secreto            | Para qué                    | Ejemplo                                              |
| ------------------ | ---------------------------- | ---------------------------------------------------- |
| `SONAR_TOKEN`    | Token del servidor SonarQube | `sqp_1a2b3c…`                                     |
| `SONAR_HOST_URL` | URL del servidor SonarQube   | `https://sonarcloud.io` o `http://mi-sonar:9000` |
| `SNYK_TOKEN`     | Token de la cuenta de Snyk   | ver app.snyk.io                                      |

> **Importante (SonarQube):** el `docker-compose.yml` del proyecto es para
> uso **local**. En CI **no** se levanta ese servidor; por eso
> `SONAR_HOST_URL` debe apuntar a un SonarQube **accesible desde GitHub**
> (SonarCloud o un servidor propio con URL pública). Si apunta a
> `localhost:9000`, el análisis fallará.

---

## 5. Pasos para dejarlo funcionando en GitHub

### 5.1 Preparar el repositorio local

Desde la carpeta `15-all/`:

```bash
cd 15-all
git init
git add .
git commit -m "Pipeline de calidad con GitHub Actions"
```

> El `.gitignore` ya excluye `target/`, `data/*.db`, `.scannerwork/`, etc.
> Verifica con `git status` que **no** se suban `app.log`, `target/` ni bases
> SQLite.

### 5.2 Crear el repositorio en GitHub y subir

```bash
git branch -M main
git remote add origin https://github.com/<usuario>/<repo>.git
git push -u origin main
```

### 5.3 Configurar los secretos (opcional)

Repite la sección 4 para `SONAR_TOKEN`, `SONAR_HOST_URL` y `SNYK_TOKEN`.

### 5.4 Ver la ejecución

1. En GitHub, entra a la pestaña **Actions**.
2. Verás el workflow **Calidad de código** ejecutándose tras el `push`.
3. Entra a la ejecución para ver cada job y descargar los **artefactos**
   (reportes de PMD, SpotBugs, Surefire, PIT, JaCoCo, Gatling, JMeter).
4. Para lanzarlo a mano: **Actions** → **Calidad de código** →
   **Run workflow**.

### 5.5 Requisitos previos de las tecnologías

| Tecnología                                                       | Requisito en CI                                                      |
| ----------------------------------------------------------------- | -------------------------------------------------------------------- |
| Spotless, Checkstyle, PMD, SpotBugs, JUnit, PIT, JaCoCo, Cucumber | Ninguno (lo instala Maven).                                          |
| SonarQube                                                         | `SONAR_TOKEN` + `SONAR_HOST_URL` (servidor accesible).           |
| Snyk                                                              | `SNYK_TOKEN`.                                                      |
| Docker + Trivy                                                    | `ubuntu-latest` ya trae Docker.                                    |
| ZAP, Gatling, JMeter                                              | `ubuntu-latest` ya trae lo necesario; la app se levanta en el job. |

---

## 6. Cómo probar el pipeline localmente (antes de subirlo)

```bash
cd 15-all

# 01–07 (calidad + pruebas + mutación + cobertura) en un solo comando:
./mvnw clean verify

# Por tecnología (lo mismo que corre cada job):
./mvnw spotless:check
./mvnw checkstyle:check
./mvnw pmd:check
./mvnw compile spotbugs:check
./mvnw test
./mvnw test-compile org.pitest:pitest-maven:mutationCoverage
./mvnw test jacoco:report jacoco:check

# SonarQube (necesita el servidor local levantado)
docker compose up -d
./mvnw test jacoco:report sonar:sonar -Dsonar.token=TU_TOKEN -Dsonar.host.url=http://localhost:9000

# Snyk
snyk auth
snyk test --severity-threshold=critical
```

Para las que necesitan la app levantada (Cucumber, ZAP, Gatling, JMeter):

```bash
# Terminal 1
./mvnw spring-boot:run

# Terminal 2
./mvnw test -Dtest=CucumberRunnerTest
./mvnw gatling:test
./mvnw -Pjmeter jmeter:configure@configuration jmeter:jmeter@jmeter-tests jmeter:results@jmeter-check-results
```

---

## 7. Variante: subir la carpeta `calidad/` completa como repositorio

Si prefieres un solo repositorio con todos los módulos (`01-…`, `15-all`,
etc.), debes:

1. Mover el workflow a la raíz:

   ```bash
   mkdir -p .github/workflows
   mv codigo/15-all/.github/workflows/calidad-codigo.yml .github/workflows/
   ```
2. En `calidad-codigo.yml`, agregar el directorio de trabajo en **cada job**
   (los `uses:` no cambian):

   ```yaml
   jobs:
     spotless:
       name: Spotless (formato de código)
       runs-on: ubuntu-latest
       defaults:
         run:
           working-directory: codigo/15-all
       steps:
         # ...
   ```

   Esto hace que todos los `run: ./mvnw …` se ejecuten dentro de
   `codigo/15-all`, donde está el `pom.xml`.
3. El `docker build` del job `container` también debe apuntar a esa carpeta:

   ```yaml
   - name: Construir la imagen Docker
     run: docker build -t alumnos-api:${{ github.sha }} codigo/15-all
   ```
4. El paso de ZAP usa `.zap/rules.tsv`; con `working-directory: codigo/15-all`
   lo encuentra igual, pero la action `zaproxy/action-baseline` se ejecuta en
   la raíz del repo, así que revisa que `rules_file_name` siga siendo válido
   (si no, usa la ruta completa `codigo/15-all/.zap/rules.tsv`).

> La opción **recomendada** es la de la sección 2: usar `15-all/` como raíz
> del repositorio. Es más simple y evita rutas relativas.

---

## 8. Notas y limitaciones

- **SonarQube no se levanta en CI.** El `docker-compose.yml` es local. Para
  CI necesitas un servidor externo (SonarCloud o propio).
- **Trivy escanea solo el SO** (`vuln-type: os`). Las dependencias del jar las
  cubre **Snyk**. El resultado "sin vulnerabilidades" depende de la imagen
  base `eclipse-temurin:21-jre-alpine`: si Alpine publica CVEs nuevos, el job
  puede empezar a fallar sin que cambie el código. Si quieres máxima
  reproducibilidad, fija la imagen base por **digest** en el `Dockerfile`.
- **ZAP** corre con `fail_action: true` y `.zap/rules.tsv` marcando las
  cabeceras de seguridad como `FAIL`; si `SecurityHeadersFilter` deja de
  enviarlas, el job falla (es lo esperado).
- Los pasos que levantan la app guardan el log en `app.log` y lo suben como
  artefacto si el job falla, para depurar más rápido.
