# Kit de ejecución — API Alumnos (`15-all`)

Proyecto: `calidad - EJEMPLO/codigo/15-all`  
Requisitos: **Java 21+**, Docker Desktop, (opcional) cuenta Snyk.

---

## Orden recomendado

### 1) Calidad + unitarias + cobertura (sin app)

```powershell
cd "calidad - EJEMPLO\codigo\15-all"

# Si Spotless falla por CRLF en Windows:
.\mvnw.cmd spotless:apply

.\mvnw.cmd clean verify
```

Evidencias a copiar a `trabajo-grupo/evidencias/analisis-estatico/`:

| Archivo | Caso |
|---|---|
| Log de consola / `mvn-verify-log.txt` | CP-EST-01, CP-REG-01 |
| `target/site/jacoco/index.html` | CP-EST-02 |
| `target/pit-reports/**/index.html` | CP-EST-02 |
| `target/site/pmd.html` | CP-EST-01 |
| `target/checkstyle-result.xml` | CP-EST-01 |

### 2) Funcional API (app levantada)

Terminal A:
```powershell
.\mvnw.cmd spring-boot:run
```

Terminal B:
```powershell
curl http://localhost:8080/api/v1/alumnos
curl -X POST http://localhost:8080/api/v1/alumnos -H "Content-Type: application/json" -d "{\"rut\":\"12.345.678-9\",\"nombres\":\"Ana\",\"apellidos\":\"Perez\",\"email\":\"ana.perez@duocuc.cl\",\"carrera\":\"Informatica\",\"edad\":21}"
```

Swagger: http://localhost:8080/swagger-ui.html

### 3) Cucumber
```powershell
.\mvnw.cmd test -Dtest=CucumberRunnerTest
```

### 4) Docker + Trivy
```powershell
.\mvnw.cmd -DskipTests package
docker build -t alumnos-api:1.0.0 .
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --severity CRITICAL,HIGH --format table alumnos-api:1.0.0
```
(Ya existe `trivy-report.html` de referencia en el proyecto.)

### 5) ZAP (app en 8080)
```powershell
docker run --rm --network host -v "${PWD}:/zap/wrk/:rw" ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t http://localhost:8080 -i -c .zap/rules.tsv
```

### 6) Rendimiento (app en 8080)
```powershell
.\mvnw.cmd gatling:test
.\mvnw.cmd -Pjmeter verify
```

### 7) Contraste didáctico `con-error`
Abrir y documentar fallos intencionales en:
- `02-calidad-codigo-checkstyle/con-error`
- `09-security-SNYK/con-error`
- `11-contenedor-Trivy/con-error`
- `12-dast-OWASP-ZAP/con-error`

---

## Reparto

| Integrante | Bloque |
|---|---|
| Camilo | verify, Spotless, Sonar, Snyk, Trivy |
| Alison | App up, curl/Postman, Cucumber, ZAP |
| Macarena | Gatling, JMeter, contraste con-error, tablas informe |
