# API de Alumnos — Microservicio base

Microservicio de ejemplo con **Spring Boot 3 + Maven + SQLite**, pensado como
base para los siguientes módulos del curso de Ingeniería DevOps.

Incluye:

- CRUD de alumnos (`/api/v1/alumnos`).
- **OpenAPI** con contrato YAML propio (`contract-first`).
- **Swagger UI** y **Redoc** para explorar la API.
- **Home** (`/`) con una página de presentación del microservicio.
- **Arquitectura limpia** (dominio / aplicación / infraestructura).

## Requisitos

- Java 21
- Maven 3.9+

## Ejecutar

```bash
mvn spring-boot:run
```

Luego abre:

| Recurso    | URL                                       |
| ---------- | ----------------------------------------- |
| Home       | http://localhost:8080/                    |
| Swagger UI | http://localhost:8080/swagger-ui.html     |
| Redoc      | http://localhost:8080/redoc.html          |
| OpenAPI    | http://localhost:8080/openapi/alumnos-openapi.yaml |

La base de datos SQLite se crea automáticamente en `./data/alumnos.db`.

## Tests

```bash
mvn test
```

## Calidad de código con Spotless

Este proyecto aplica **Spotless** en dos lugares:

- **`pom.xml`**: plugin `spotless-maven-plugin` con `googleJavaFormat`,
  `removeUnusedImports`, `trimTrailingWhitespace` y `endWithNewline`,
  enganchado a la fase `validate`.
- **GitHub Actions**: `.github/workflows/calidad-codigo.yml`
  (se deja como archivo aunque el repositorio todavía no esté en GitHub).

```bash
./mvnw spotless:check   # verifica el formato (falla si hay problemas)
./mvnw spotless:apply   # corrige el formato automáticamente
```

> El error de formato de la versión anterior ya está **corregido**: aquí
> `./mvnw spotless:check` pasa sin problemas.

## Calidad de código con Checkstyle

Además de Spotless, el proyecto aplica **Checkstyle** en dos lugares:

- **`pom.xml`**: `maven-checkstyle-plugin` con la configuración `checkstyle.xml`,
  enganchado a la fase `validate`.
- **GitHub Actions**: job `checkstyle` en `.github/workflows/calidad-codigo.yml`.

```bash
./mvnw checkstyle:check   # verifica las convenciones de código
```

Reglas incluidas: longitud de línea (120), sin tabulaciones, salto de línea final,
imports (sin `*` y sin imports sin usar), llaves obligatorias en bloques de control
y convenciones de nombres (tipos, métodos, campos, variables, parámetros y constantes).

> **Este directorio no tiene errores:** `./mvnw validate` (Spotless + Checkstyle)
> termina con `BUILD SUCCESS`.

## Calidad de código con PMD

Además de Spotless y Checkstyle, el proyecto aplica **PMD** en dos lugares:

- **`pom.xml`**: `maven-pmd-plugin` con la configuración `pmd-ruleset.xml`,
  enganchado a la fase `verify`.
- **GitHub Actions**: job `pmd` en `.github/workflows/calidad-codigo.yml`.

**Comando que debe ejecutarse:**

```bash
./mvnw pmd:check    # solo PMD (rápido)
./mvnw verify       # build completo: Spotless + Checkstyle + tests + PMD
```

Reglas incluidas: variables locales sin usar, campos privados sin usar,
métodos privados sin usar y bloques `catch` vacíos.

> **Este directorio no tiene errores:** `./mvnw pmd:check` termina con
> `BUILD SUCCESS` (0 violaciones).

## Calidad de código con SpotBugs

Además de Spotless, Checkstyle y PMD, el proyecto aplica **SpotBugs** en dos lugares:

- **`pom.xml`**: `spotbugs-maven-plugin` con `spotbugs-exclude.xml`, enganchado a
  la fase `verify`.
- **GitHub Actions**: job `spotbugs` en `.github/workflows/calidad-codigo.yml`.

**Comando que debe ejecutarse:**

```bash
./mvnw compile spotbugs:check   # compila y analiza el bytecode
./mvnw verify                   # build completo: Spotless + Checkstyle + tests + PMD + SpotBugs
```

> Importante: `./mvnw spotbugs:check` por sí solo **no compila**. Hay que anteponer
> `compile` (o usar `verify`); de lo contrario SpotBugs analiza clases inexistentes
> y no reporta nada.

Se excluyen los avisos `EI_EXPOSE_REP` / `EI_EXPOSE_REP2` (comunes en beans de
Spring y DTOs) mediante `spotbugs-exclude.xml`.

> **Este directorio no tiene errores** y además alcanza el **100% de cobertura**
> (ver la sección de JaCoCo más abajo).

## Pruebas unitarias con JUnit + Mockito

El proyecto incluye pruebas unitarias con **JUnit 5** y **Mockito** en
`src/test/java/cl/duoc/alumnos/application/usecase/AlumnoUseCaseTest.java`.
**En GitHub Actions** hay un job `test` que ejecuta `./mvnw test`.

```bash
./mvnw test
```

## Pruebas de mutación con PIT

Además de Spotless, Checkstyle, PMD y SpotBugs, el proyecto aplica **PIT (pitest)**
en dos lugares:

- **`pom.xml`**: `pitest-maven` con `pitest-junit5-plugin`, enganchado a la fase
  `verify`, sobre las clases de `cl.duoc.alumnos.application.usecase`.
- **GitHub Actions**: job `mutation` en `.github/workflows/calidad-codigo.yml`.

```bash
./mvnw verify                                                  # build completo (incluye PIT)
./mvnw test-compile org.pitest:pitest-maven:mutationCoverage   # solo PIT
```

La **mutación** mide si las pruebas **detectan cambios** en la lógica (no solo que
el código se ejecute). PIT modifica el bytecode y comprueba si algún test falla: un
mutante que **sobrevive** revela una prueba débil. El umbral mínimo es **80%**.

## Cobertura con JaCoCo

Se agregó **JaCoCo** en dos lugares:

- **`pom.xml`**: `jacoco-maven-plugin` con `prepare-agent`, `report` y `check`
  (regla: mínimo **100%** de líneas), enganchado a la fase `verify`.
- **GitHub Actions**: job `jacoco` en `.github/workflows/calidad-codigo.yml`.

**Comando que debe ejecutarse:**

```bash
./mvnw verify          # ejecuta las pruebas y calcula + valida la cobertura
```

El reporte queda en `target/site/jacoco/index.html`.

### Resultado: 100% de cobertura

```text
Tests run: 42, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

Cobertura de líneas: **239 / 239 = 100%**. Se excluye `AlumnosApplication` (la clase
`main`), porque es el punto de arranque de Spring Boot y no tiene lógica que probar.

### Qué se probó

| Capa         | Clase de prueba        | Qué cubre                                                        |
| ------------ | ---------------------- | ---------------------------------------------------------------- |
| Dominio      | `AlumnoTest`           | getters/setters, `equals`, `hashCode`                            |
| Dominio      | `DomainExceptionTest`  | excepciones de negocio                                           |
| Aplicación   | `AlumnoUseCaseTest`    | `listar`, `obtener`, `crear`, `actualizar`, `eliminar` (ok y error) |
| Persistencia | `AlumnoMapperTest`     | `toDomain`, `toData` (incluye `null`)                            |
| Persistencia | `AlumnoGatewayImplTest`| adaptador con repositorio mockeado                               |
| REST         | `AlumnoControllerTest` | endpoints con `MockMvc` (200/201/204/400/404/409/500)            |
| REST         | `DtoTest`              | DTOs `AlumnoRequest`, `AlumnoResponse`, `ErrorResponse`          |
| Config       | `OpenApiConfigTest`    | bean OpenAPI                                                     |

Total: **42 pruebas**, todas en verde.

> **Nota:** 100% de cobertura **no** significa 100% de calidad. Significa que todas
> las líneas fueron ejecutadas por las pruebas. La fuerza real de esas pruebas se
> mide con pruebas de mutación (PIT).

## Análisis con SonarQube (versión web)

SonarQube analiza el proyecto y aplica el **Quality Gate** (calidad, seguridad,
cobertura y duplicación). Se usa la **versión web** (SonarQube Community) corriendo
en local con Docker.

### 1. Levantar SonarQube

```bash
docker compose up -d
```

Abre http://localhost:9000 (la primera vez tarda 1-2 minutos en arrancar).
Usuario/clave iniciales: **admin / admin** (te pedirá cambiarla).

### 2. Obtener la "key" (token)

SonarQube autentica los análisis con un **token**, no con tu contraseña:

1. Inicia sesión en http://localhost:9000
2. Arriba a la derecha: **My Account** (tu avatar) → **Security**
3. En **Generate Tokens** escribe un nombre (ej. `alumnos-api`) → **Generate**
4. **Copia el token** (solo se muestra una vez), algo como
   `sqp_1a2b3c4d5e6f7g8h9i0j...`

### 3. Agregar el token

**En local** (como parámetro o variable de entorno):

```bash
# 1) compila, corre los tests y genera el reporte de JaCoCo
./mvnw clean verify

# 2) ejecuta el análisis con tu token
./mvnw sonar:sonar -Dsonar.host.url=http://localhost:9000 -Dsonar.token=TU_TOKEN
```

o con variables de entorno:

```bash
export SONAR_TOKEN=TU_TOKEN
export SONAR_HOST_URL=http://localhost:9000
./mvnw verify sonar:sonar
```

**En GitHub Actions** (secrets):

1. Repo → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**:
   - `SONAR_TOKEN` = tu token
   - `SONAR_HOST_URL` = la URL de tu SonarQube (ej. `http://mi-sonar:9000`)
3. El job `sonarqube` del workflow los usa automáticamente.

> El token **nunca** va en el código ni en el repositorio: siempre como secret.

### 4. Ver los resultados

- Dashboard: http://localhost:9000/dashboard?id=alumnos-api
- El **Quality Gate** (arriba del dashboard) indica si pasa o no.

### Configuración usada

- **`pom.xml`**: plugin `sonar-maven-plugin`.
- **`sonar-project.properties`**: `projectKey`, fuentes, tests y el reporte de JaCoCo.
- **`docker-compose.yml`**: SonarQube Community + PostgreSQL.

> **Este proyecto pasa el Quality Gate:** sin bugs, sin vulnerabilidades y con 100% de
> cobertura de pruebas.

## Seguridad de dependencias con Snyk

Snyk analiza las **dependencias** del proyecto (el `pom.xml`) y reporta
vulnerabilidades conocidas (CVE) en librerías directas y transitivas.

### Paso a paso

**1. Crear cuenta y obtener el token**

1. Entra a https://app.snyk.io y crea una cuenta (gratuita).
2. Copia tu **API token**: avatar (abajo a la izquierda) → **Account settings** →
   **Auth Token** → **Click to show** → copia el valor.
   (También puedes verlo con `snyk config get api` tras autenticarte.)

**2. Instalar el CLI y autenticarse**

```bash
npm install -g snyk        # o: brew install snyk
snyk auth                  # abre el navegador, o:
snyk auth TU_TOKEN         # autenticación directa con el token
snyk whoami                # verifica que quedaste autenticado
```

**3. Analizar**

```bash
snyk test --severity-threshold=critical   # falla si hay vulnerabilidades criticas
snyk monitor                              # sube el proyecto a la web de Snyk
```

> `snyk test` devuelve un código de salida ≠ 0 si encuentra vulnerabilidades; por eso
> sirve para cortar el pipeline.

**4. Agregar el token en GitHub Actions (secrets)**

1. Repo → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** → `SNYK_TOKEN` = tu token
3. El job `snyk` del workflow lo usa automáticamente:

```yaml
      - name: Instalar Snyk CLI
        uses: snyk/actions/setup@master
      - name: Analizar dependencias con Snyk
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        run: snyk test --severity-threshold=critical
```

### Resultado: sin vulnerabilidades críticas

```text
✔ Tested 77 dependencies for known issues, no vulnerable paths found.
```

### Sobre el archivo `.snyk`

Las vulnerabilidades **críticas transitivas** del framework base (Spring Boot 3.3.5,
Tomcat, Jackson) están **ignoradas** en `.snyk` como *riesgo aceptado* (se corrigen
actualizando el framework). Así el análisis se centra en las dependencias que agrega
el proyecto. El caso con una dependencia vulnerable agregada está en el módulo de
Snyk (`../09-security-SNYK/con-error`).

> Este proyecto **pasa** `snyk test`.

## Integración / BDD con Cucumber

**Cucumber** permite escribir las pruebas en lenguaje natural (Gherkin) para validar el
**comportamiento** esperado por el negocio, no solo la implementación.

### Cómo se agrega

**1. Dependencias (`pom.xml`, scope `test`)**

```xml
<dependency>
    <groupId>io.cucumber</groupId>
    <artifactId>cucumber-java</artifactId>
    <version>${cucumber.version}</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>io.cucumber</groupId>
    <artifactId>cucumber-junit-platform-engine</artifactId>
    <version>${cucumber.version}</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.junit.platform</groupId>
    <artifactId>junit-platform-suite</artifactId>
    <scope>test</scope>
</dependency>
```

`cucumber-java` trae las anotaciones y expresiones; `cucumber-junit-platform-engine`
permite ejecutar Cucumber sobre JUnit Platform; `junit-platform-suite` aporta el motor
de la suite (`@Suite`).

**2. El `.feature` (Gherkin)** — `src/test/resources/features/alumnos.feature`

```gherkin
# language: es
Característica: Gestión de alumnos

  Escenario: Registrar un alumno nuevo
    Dado que no existe un alumno con RUT "12.345.678-9"
    Cuando registro un alumno con RUT "12.345.678-9" y nombre "Ana"
    Entonces el alumno "12.345.678-9" queda registrado
    Entonces la lista de alumnos tiene 1 elemento

  Escenario: No permitir un RUT duplicado
    Dado que ya existe un alumno con RUT "12.345.678-9"
    Cuando intento registrar otro alumno con RUT "12.345.678-9"
    Entonces el registro falla por RUT duplicado
```

**3. Los step definitions (glue)** — `src/test/java/cl/duoc/alumnos/bdd/AlumnoSteps.java`

Cada frase de Gherkin se conecta con un método anotado:

```java
@Dado("que no existe un alumno con RUT {string}")
public void queNoExiste(String rut) { ... }

@Cuando("registro un alumno con RUT {string} y nombre {string}")
public void registro(String rut, String nombre) { ... }

@Entonces("la lista de alumnos tiene {int} elemento(s)")
public void listaTiene(int cantidad) {
  assertThat(useCase.listar()).hasSize(cantidad);
}
```

`{string}` e `{int}` son *Cucumber Expressions* que capturan parámetros. El glue usa
`AlumnoUseCase` con un `InMemoryAlumnoGateway` (sin base de datos).

**4. El runner** — `src/test/java/cl/duoc/alumnos/bdd/CucumberRunnerTest.java`

```java
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(key = GLUE_PROPERTY_NAME, value = "cl.duoc.alumnos.bdd")
public class CucumberRunnerTest {}
```

### Cómo ejecutarlo

```bash
./mvnw test                              # corre JUnit + Cucumber
./mvnw test -Dtest=CucumberRunnerTest    # solo los escenarios de Cucumber
./mvnw verify                            # build completo (incluye cobertura, etc.)
```

En **GitHub Actions** hay un job `cucumber` (encadenado tras `snyk`) que ejecuta
estos escenarios con `./mvnw test`.

Resultado esperado:

```text
Tests run: 2, Failures: 0, Errors: 0, Skipped: 0 -- in cl.duoc.alumnos.bdd.CucumberRunnerTest
[INFO] BUILD SUCCESS
```

> **Todo pasa:** `./mvnw verify` termina en `BUILD SUCCESS` (Spotless, Checkstyle, PMD,
> SpotBugs, JaCoCo 100% y las pruebas JUnit + Cucumber).

## Contenedor con Docker

El proyecto se empaqueta como imagen con un **`Dockerfile`** multi-stage:

1. **Build** (`maven:3.9-eclipse-temurin-21`): compila el JAR.
2. **Runtime** (`eclipse-temurin:21-jre-alpine`): imagen mínima, JRE 21 y usuario
   **no-root** (`app`).

```bash
./mvnw -DskipTests package           # genera target/alumnos-api-1.0.0.jar
docker build -t alumnos-api:1.0.0 .   # construye la imagen
docker run --rm -p 8080:8080 alumnos-api:1.0.0
```

Escaneo local con Trivy:

```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image --scanners vuln --pkg-types os \
  --severity CRITICAL,HIGH --exit-code 1 alumnos-api:1.0.0
```

**En GitHub Actions** hay un job `container` (encadenado tras `cucumber`) que
construye la imagen y la escanea con **Trivy**:

```yaml
      - name: Escanear la imagen con Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: alumnos-api:${{ github.sha }}
          vuln-type: 'os'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'
```

Trivy analiza la imagen y falla si encuentra vulnerabilidades **CRITICAL/HIGH**. El
escaneo se acota a los **paquetes del sistema operativo** (`--pkg-types os`): las
dependencias del jar (Spring, etc.) ya las cubre **Snyk** en el paso anterior y las
del framework base están aceptadas como riesgo en `.snyk`. Aquí **no reporta
vulnerabilidades**: la base Alpine está actualizada y sin paquetes innecesarios.

> **Este directorio no tiene errores:** `docker build` y el escaneo de Trivy pasan.
> Ver `../11-contenedor-Trivy/con-error` para la imagen con base vulnerable.

## Seguridad dinámica (DAST) con OWASP ZAP

**OWASP ZAP** prueba la aplicación **mientras está funcionando** (DAST): lanza un
*spider* y un análisis **pasivo** contra una URL y reporta alertas de seguridad
(cabeceras inseguras, cookies, información expuesta, etc.).

La aplicación agrega cabeceras de seguridad a todas las respuestas mediante
`SecurityHeadersFilter`:

| Cabecera                  | Valor                 | Protege contra             |
| ------------------------- | --------------------- | -------------------------- |
| `X-Content-Type-Options`  | `nosniff`             | sniffing de contenido      |
| `X-Frame-Options`         | `DENY`                | clickjacking               |
| `Content-Security-Policy` | `default-src 'self'`  | inyección (XSS)            |
| `Referrer-Policy`         | `no-referrer`         | fuga de referrer           |
| `Permissions-Policy`      | `geolocation=()`      | APIs del navegador         |

```bash
./mvnw spring-boot:run            # levanta la app en http://localhost:8080
# en otra terminal:
docker run --rm --network host -v "$PWD":/zap/wrk/:rw \
  ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
  -t http://localhost:8080 -i -c .zap/rules.tsv
```

**En GitHub Actions** hay un job `dast` (encadenado tras `container`) que levanta la
aplicación y ejecuta `zaproxy/action-baseline` contra `http://localhost:8080`, con
`fail_action: true`:

```yaml
      - name: Escanear con ZAP (baseline)
        uses: zaproxy/action-baseline@v0.15.0
        with:
          target: 'http://localhost:8080'
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-i'
          fail_action: 'true'
```

El archivo `.zap/rules.tsv` marca las cabeceras de seguridad como **FAIL** y `-i`
deja el resto de las reglas en INFO, para que el resultado dependa solo de ellas.

> **Este directorio no tiene errores:** ZAP termina con `FAIL: 0` y el job pasa.
> Ver `../12-dast-OWASP-ZAP/con-error` para la app sin cabeceras de seguridad.

## Pruebas de carga con Gatling

**Gatling** simula usuarios concurrentes y valida **SLAs** (latencia, throughput y
errores). La simulación está en
`src/test/java/cl/duoc/alumnos/performance/AlumnosSimulation.java` (DSL Java):

```java
private static final ScenarioBuilder ESCENARIO =
    scenario("Listar alumnos")
        .exec(http("listar").get("/api/v1/alumnos").check(status().is(200)));

setUp(ESCENARIO.injectOpen(rampUsers(10).during(Duration.ofSeconds(5))))
    .assertions(
        global().failedRequests().count().lt(1L),
        global().responseTime().mean().lt(2000))
    .protocols(HTTP_PROTOCOL);
```

```bash
./mvnw spring-boot:run        # levanta la app en http://localhost:8080
# en otra terminal:
./mvnw gatling:test           # ejecuta la simulación y valida los SLAs
```

**En GitHub Actions** hay un job `performance` (encadenado tras `dast`) que levanta
la aplicación y ejecuta `./mvnw gatling:test`.

Resultado esperado:

```text
Global: count of failed events is less than 1.0 : true (actual : 0.0)
Global: mean of response time is less than 2000.0 : true (actual : 47.0)
[INFO] BUILD SUCCESS
```

> **Este directorio no tiene errores:** Gatling termina en `BUILD SUCCESS`.
> Ver `../13-performance-Gatling/con-error` para la simulación que apunta a una ruta inexistente.

## Pruebas de carga con JMeter

**Apache JMeter** es la alternativa clásica para pruebas de carga. El plan de prueba
está en `src/test/jmeter/alumnos.jmx` (10 usuarios, 1 iteración, `GET
/api/v1/alumnos`) y usa una **Response Assertion** que exige HTTP 200.

```bash
./mvnw spring-boot:run        # levanta la app en http://localhost:8080
# en otra terminal:
./mvnw -Pjmeter verify        # ejecuta el plan de JMeter y valida los resultados
```

El perfil `jmeter` activa el `jmeter-maven-plugin`; sin el perfil, `./mvnw verify`
**no** ejecuta JMeter (porque necesita la app levantada).

**En GitHub Actions** hay un job `performance-jmeter` (encadenado tras
`performance`) que levanta la aplicación y ejecuta `./mvnw -Pjmeter verify`.

Resultado esperado:

```text
summary =     10 in 00:00:05 =    2,2/s Avg:    34 Min:     8 Max:   269 Err:     0 (0,00%)
[INFO] Successful requests:         10
[INFO] Failed requests:             0
[INFO] BUILD SUCCESS
```

> **Este directorio no tiene errores:** JMeter termina en `BUILD SUCCESS`.
> Ver `../14-performance-JMeter/con-error` para el plan que apunta a una ruta inexistente.

## Arquitectura

```
cl.duoc.alumnos
├── domain                     # Núcleo: no conoce frameworks
│   ├── model                  # Alumno
│   ├── gateway                # AlumnoGateway (puerto de salida)
│   └── exception              # Excepciones de negocio
├── application
│   └── usecase                # AlumnoUseCase (reglas + orquestación)
└── infrastructure             # Detalles: frameworks, BD, HTTP
    ├── adapters/jpa           # Adaptador SQLite (JPA) + mapper
    ├── entrypoints/rest       # Controlador REST + DTOs + manejo de errores
    └── config                 # Configuración OpenAPI
```

El flujo de dependencias apunta siempre **hacia el dominio**: la infraestructura
implementa los puertos que el dominio define.

## Endpoints

| Método | Ruta                     | Descripción                  |
| ------ | ------------------------ | ---------------------------- |
| GET    | `/api/v1/alumnos`        | Lista todos los alumnos      |
| GET    | `/api/v1/alumnos/{id}`   | Obtiene un alumno por id     |
| POST   | `/api/v1/alumnos`        | Crea un alumno               |
| PUT    | `/api/v1/alumnos/{id}`   | Actualiza un alumno          |
| DELETE | `/api/v1/alumnos/{id}`   | Elimina un alumno            |

### Ejemplo

```bash
curl -X POST http://localhost:8080/api/v1/alumnos \
  -H "Content-Type: application/json" \
  -d '{
        "rut": "12.345.678-9",
        "nombres": "Ana",
        "apellidos": "Pérez",
        "email": "ana.perez@duocuc.cl",
        "carrera": "Ingeniería en Informática",
        "edad": 21
      }'
```

## Cómo escalar esta base

- Reemplazar SQLite por PostgreSQL cambiando el datasource y el dialecto.
- Añadir nuevas capas/entidades siguiendo el mismo patrón dominio → puerto → adaptador.
- Incorporar los controles del pipeline (Spotless, Checkstyle, PMD, SpotBugs, JaCoCo,
  SonarQube, Trivy, etc.) sobre este proyecto.
