# Paso a paso — levantar Atlas y ejecutar las pruebas

**ISY1102 · Alison Aranda, Macarena Muñoz, Camilo Romero**  
**Software:** Atlas (CreaLab Spa) · **Fecha de referencia:** 17 de octubre de 2026

Sirve para que cualquier integrante clone el repositorio, levante el ambiente con Docker y repita los casos del informe. No hace falta instalar Node ni PostgreSQL: van dentro de los contenedores.

## 1. Qué se necesita

- Docker Desktop encendido (el ícono de la ballena en ejecución).
- Git.
- El repositorio: https://github.com/milotkg2/seguridad-calidad-software-ev2-atlas

Comprobar Docker:

```powershell
docker version
```

Tiene que responder la sección Client y la sección Server. Si Server no aparece, abrir Docker Desktop y esperar a que diga que está en marcha.

## 2. Clonar y entrar a la carpeta

```powershell
git clone https://github.com/milotkg2/seguridad-calidad-software-ev2-atlas.git
cd seguridad-calidad-software-ev2-atlas\codigo\atlas
```

Si la carpeta ya está en el equipo, basta con entrar a `codigo\atlas`.

## 3. Levantar los tres servicios

```powershell
docker compose up -d --build
```

La primera vez descarga imágenes y compila la API y la pantalla. Puede tardar varios minutos. Al terminar quedan tres servicios:

| Servicio | Función | Dirección en este equipo |
|---|---|---|
| `db` | PostgreSQL 16 | Solo dentro de Docker |
| `api` | Express, puerto interno 3000 | http://localhost:3010 |
| `web` | Pantalla React | http://localhost:8080 |

El puerto público de la API es **3010** porque en el equipo del grupo el 3000 ya lo usaba otro proyecto. Dentro de la red de Docker la API sigue en el 3000, y la pantalla la llama por `/api`.

Revisar que estén arriba:

```powershell
docker compose ps
```

`db` debe figurar healthy y `api` y `web` en ejecución. Si la API acaba de partir, esperar unos segundos: al primer arranque crea los usuarios de prueba.

## 4. Comprobar que responde

En el navegador:

- Pantalla: http://localhost:8080
- Salud de la API: http://localhost:3010/api/salud
- Swagger: http://localhost:3010/api/docs

La salud debe mostrar `{"servicio":"atlas","estado":"ok"}`.

## 5. Usuarios y datos de prueba

Contraseña de los dos, solo en este ambiente local: `Clave#Segura2026`

| Usuario | Rol | Qué puede hacer |
|---|---|---|
| `jperez` | administrador | Crear, editar y dar de baja |
| `editor1` | editor | Solo ver. Crear o eliminar responde 403 |

Datos sembrados la primera vez que la base está vacía:

- Empresa CreaLab Spa, id 1
- Cliente Distribuidora Andina SpA, id 101
- Contrato CT-0012, estado activo entre el 01-01-2026 y el 31-12-2026

## 6. Prueba por la pantalla

1. Abrir http://localhost:8080
2. Entrar con `jperez` y `Clave#Segura2026`. Debe aparecer el listado de clientes.
3. Abrir **Distribuidora Andina SpA** y comprobar el contrato **CT-0012** con estado activo.
4. Salir.
5. Entrar con `editor1` y la misma contraseña. El menú de alta no debe ofrecer escritura. La API, aunque se llame directo, responde 403.

## 7. Pruebas de la API en un solo paso

Desde `codigo\atlas`, con los contenedores ya arriba:

```powershell
powershell -ExecutionPolicy Bypass -File .\probar.ps1
```

El script recorre los casos y escribe `OK` o `FALLO` con el código HTTP. El resultado esperado es **15 correctas, 0 fallidas**.

| Caso | Qué hace | HTTP esperado |
|---|---|---|
| Salud | GET `/api/salud` | 200 |
| CP-FUN-01 | Login de `jperez` | 200 y token |
| Login inválido | Contraseña incorrecta | 401 |
| Login editor | Login de `editor1` | 200 |
| CP-SEG-01 | El editor crea un cliente | 403 |
| CP-SEG-01 | El editor elimina el cliente 101 | 403 |
| Listado | Busca por nombre Andina | 200 |
| Alta | El administrador crea una pyme temporal | 201 |
| CP-FUN-02 | Baja lógica de esa pyme | 200 y `eliminacion: logica` |
| Seguimiento | Consultar el cliente ya dado de baja | 404 |
| Contrato | Contratos del cliente 101 | 200 y código CT-0012 |
| CP-INT-01 | Adjuntar una imagen al contrato 1 | 201 |
| Enlace | Generar enlace temporal de 7 días | 201 |
| RF-6 | Leer la auditoría de la empresa 1 | 200 |
| RF-1.2 | Cerrar la sesión del administrador | 200 |

Guardar la salida de la consola como evidencia, junto con `evidencias/atlas/ejecucion-api.txt`.

## 8. Repetir un caso a mano

Login del administrador:

```powershell
curl.exe -s -w "`nHTTP %{http_code}`n" -X POST http://localhost:3010/api/auth/login -H "Content-Type: application/json" --data-binary "@login.json"
```

El archivo `login.json` contiene `{"nombre_usuario":"jperez","password":"Clave#Segura2026"}`. En la respuesta se copia `token`. Las llamadas siguientes llevan la cabecera `Authorization: Bearer <token>`.

Escritura del editor, que debe fallar:

```powershell
curl.exe -s -w "`nHTTP %{http_code}`n" -X POST http://localhost:3010/api/empresas/1/clients -H "Authorization: Bearer TOKEN_EDITOR" -H "Content-Type: application/json" -d "{\"nombre\":\"No autorizado\"}"
```

El cuerpo esperado es: `El rol editor solo puede visualizar datos.` y el código **403**.

## 9. Apagar el ambiente

Este paso va al final, cuando ya terminaron las pruebas 11 a 14. Si se apaga ahora, k6, npm audit y ZAP no tienen a dónde conectarse.

```powershell
docker compose down
```

Eso detiene los contenedores y conserva la base y los documentos. Para borrar también los datos de prueba y volver a sembrar desde cero:

```powershell
docker compose down -v
```

La próxima subida crea de nuevo a `jperez`, `editor1`, el cliente 101 y el contrato CT-0012.

## 10. Si algo falla

| Síntoma | Qué hacer |
|---|---|
| `docker version` no muestra Server | Abrir Docker Desktop y esperar |
| El puerto 3010 o 8080 está ocupado | `docker compose ps` y cerrar el otro programa, o cambiar el puerto publicado en `docker-compose.yml` |
| La salud no responde al instante | Esperar y repetir. La API espera a PostgreSQL y luego siembra |
| El login dice usuario incorrecto | La base ya existía vacía o a medias. `docker compose down -v` y volver a levantar |
| `probar.ps1` no corre | Usar `powershell -ExecutionPolicy Bypass -File .\probar.ps1` dentro de `codigo\atlas` |
| La pantalla abre y la API no | Revisar `docker compose logs api` |

## Qué hace cada herramienta y cómo funciona

Estas seis piezas cubren el trabajo. Las tres primeras arman el ambiente y los casos funcionales. Las cuatro últimas miden carga, dependencias y la pantalla encendida.

### Docker Desktop y Docker Compose

Docker ejecuta cada parte de Atlas en un contenedor: un proceso con su propio sistema de archivos, aislado del Windows. Compose lee `docker-compose.yml` y levanta tres a la vez.

1. `db` arranca PostgreSQL 16 y, si el volumen está vacío, corre `init.sql`.
2. `api` construye la imagen Node, instala las dependencias y deja Express escuchando en el puerto 3000 de esa red interna.
3. `web` compila la pantalla React y la publica con nginx en el puerto 80 del contenedor.

Entre ellos se llaman por el nombre del servicio (`db`, `api`). El equipo solo ve lo que el archivo publica: la API en http://localhost:3010 y la pantalla en http://localhost:8080. `docker compose ps` muestra si ese proceso sigue vivo. `docker compose down` lo detiene.

### probar.ps1

Es la prueba funcional y de seguridad de la API encendida. El script llama a `curl.exe`, envía el JSON de cada caso y compara el código HTTP con el esperado. Cuenta correctas y fallidas. Para el informe vale el 200 del login, el 401 de la clave mala, el 403 del editor, la baja lógica y el documento. No abre el código fuente: si la API está apagada, no hay resultado.

### k6

k6 mide carga. El archivo `pruebas\carga.js` tiene dos funciones. `setup` hace un solo login de `jperez` y guarda el token. `default` es lo que repite cada usuario virtual: un GET del listado de clientes con ese token.

`options` pide 200 usuarios a la vez durante 20 segundos, y dos umbrales: menos de 1 % de respuestas fallidas y percentil 95 bajo 300 ms. El percentil 95 es el tiempo por debajo del cual cayó el 95 % de las peticiones. k6 corre dentro de su propio contenedor y llega a Atlas por `host.docker.internal:3010`, que es el Windows visto desde Docker. Al terminar calcula promedios y el p95. Si un umbral no se cumple, el proceso termina con código 99 aunque todas las respuestas hayan sido 200. En esta corrida el fallo fue el tiempo, no la cantidad de errores.

### npm audit

npm audit revisa las dependencias de la API sin llamarla. Dentro del contenedor, npm lee las versiones instaladas en `node_modules` y las compara con la base pública de avisos. Si una versión tiene una vulnerabilidad conocida, la lista con gravedad baja, moderada o alta, y dice qué paquete la arrastra. El código 1 significa «hay avisos», no «el comando se rompió». El arreglo automático que propone sube Express a 4.22.3, fuera de la versión fijada en el proyecto. Es un análisis estático de dependencias: la API puede estar encendida, pero el informe no sale de las peticiones HTTP.

### Trivy

Trivy lee la imagen `atlas-api` ya construida, capa por capa. Detecta el sistema operativo (Alpine) y los `package.json` de Node que quedaron dentro. Compara esas versiones con su base de CVE. No abre el navegador ni envía un login.

Se diferencia de npm audit en el alcance. npm audit mira las librerías de la aplicación. Trivy mira además el Alpine de la imagen y herramientas que vienen con Node, como el propio npm. Por eso el número de hallazgos altos de Trivy es mayor. El código 0 significa que el escaneo terminó y escribió la tabla.

### OWASP ZAP baseline

ZAP prueba la aplicación encendida. En modo baseline recorre los enlaces de la página (spider) y revisa las respuestas que ya recibió (análisis pasivo): cabeceras, caché y datos que el servidor revela. Con la bandera `-I` los avisos no cortan el comando.

El destino de este paso es http://localhost:8080, la pantalla de nginx, no el puerto 3010 de la API. Por eso los avisos salen de la pantalla: faltan cabeceras como X-Frame-Options y Content-Security-Policy. `FAIL-NEW: 0` significa que no apareció una alerta de la categoría fallo. `WARN-NEW` son recomendaciones. `PASS` son controles que sí estaban en orden. El HTML `zap-pantalla.html` es el informe para abrir en el navegador.

### Cómo se relacionan

| Herramienta | Tipo | Qué mira | Atlas tiene que estar encendido |
|---|---|---|---|
| Docker Compose | Ambiente | Que los tres servicios existan | Los crea |
| probar.ps1 | Funcional y seguridad | Códigos HTTP de login, rol, baja y documento | Sí, puerto 3010 |
| k6 | Carga | 200 usuarios y el p95 del listado | Sí, puerto 3010 |
| npm audit | Dependencias, estático | Avisos de las librerías de la API | Basta el contenedor de la API |
| Trivy | Imagen, estático | CVE de Alpine y de los paquetes dentro de la imagen | Basta que la imagen exista |
| OWASP ZAP | Dinámico, pasivo | Cabeceras y respuestas de la pantalla | Sí, puerto 8080 |

## Antes de los pasos 11 a 14

Los pasos 11 a 14 se corren con Atlas encendido. No hace falta instalar k6, npm, Trivy ni ZAP en Windows: cada uno entra por una imagen de Docker. La primera vez esa imagen se descarga y el comando puede tardar varios minutos. Una línea que diga `Unable to find image` significa que la está bajando, no que la prueba falló.

Abrir PowerShell y entrar otra vez a la carpeta del paso 2. El prompt tiene que terminar en `\atlas`:

```powershell
cd seguridad-calidad-software-ev2-atlas\codigo\atlas
docker compose ps
```

Tienen que aparecer `api` y `web` en ejecución, y `db` healthy. Si no están, volver a levantarlos y esperar a que la salud responda:

```powershell
docker compose up -d
```

En el navegador, http://localhost:3010/api/salud debe mostrar `{"servicio":"atlas","estado":"ok"}` y http://localhost:8080 debe abrir la pantalla. Sin esas dos páginas, los pasos 11 y 14 no tienen destino.

La salida de cada comando se ve en la consola y además queda guardada. En PowerShell, las líneas en rojo suelen ser el canal de aviso de Docker. El resultado se lee al final del texto, no por el color.

## 11. Carga con k6 (CP-PERF-01)

Seguir en `codigo\atlas`. Este comando monta la carpeta `pruebas`, entra como `jperez` y durante 20 segundos lanza 200 usuarios contra el listado de clientes:

```powershell
New-Item -ItemType Directory -Force -Path ..\..\evidencias\atlas\otras | Out-Null
docker run --rm -v "${PWD}\pruebas:/scripts" grafana/k6 run /scripts/carga.js 2>&1 | Tee-Object -FilePath ..\..\evidencias\atlas\otras\k6-carga.txt
Write-Output "CODIGO $LASTEXITCODE"
```

Qué esperar:

1. La primera vez, la descarga de `grafana/k6`.
2. Unas líneas `running` con `200/200 VUs` durante unos 20 segundos.
3. Al cierre, `checks_succeeded` en 100 % y `http_req_failed` en 0 %.
4. `CODIGO 99`. Ese 99 es el resultado esperado: k6 avisa que el p95 superó los 300 ms. La herramienta sí terminó.

En la corrida del 17 de octubre de 2026 hubo 4428 peticiones, 0 % de error y p95 de 1,28 s. Una corrida nueva puede variar el tiempo. El archivo queda en `evidencias\atlas\otras\k6-carga.txt`. Es el INC-02, grave y abierto.

## 12. npm audit

Seguir en `codigo\atlas`. El comando entra al servicio `api` que ya está corriendo. No hace falta buscar el nombre del contenedor:

```powershell
docker compose exec api npm audit --audit-level=low 2>&1 | Tee-Object -FilePath ..\..\evidencias\atlas\otras\npm-audit-api.txt
Write-Output "CODIGO $LASTEXITCODE"
```

Qué esperar:

1. Un informe con paquetes como `express`, `body-parser`, `cookie`, `path-to-regexp`, `qs` y `send`.
2. Una línea final parecida a `7 vulnerabilities (3 low, 1 moderate, 3 high)`.
3. `CODIGO 1`. Ese 1 significa que npm encontró vulnerabilidades. El informe es válido.

El arreglo que propone npm instala Express 4.22.3, fuera de la versión fijada en el proyecto. El archivo queda en `evidencias\atlas\otras\npm-audit-api.txt`. Es parte del INC-05.

## 13. Trivy sobre la imagen

Seguir en `codigo\atlas`. Este comando no llama a la página: lee la imagen que creó `docker compose up -d --build`. La primera vez descarga la base de vulnerabilidades y puede tardar más que los otros.

```powershell
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --severity CRITICAL,HIGH,MEDIUM --no-progress atlas-api:latest 2>&1 | Tee-Object -FilePath ..\..\evidencias\atlas\otras\trivy-api.txt
Write-Output "CODIGO $LASTEXITCODE"
```

Qué esperar:

1. Líneas `Downloading vulnerability DB` y después `Detected OS` con Alpine.
2. Una tabla con `atlas-api:latest (alpine ...)` y otra con paquetes `node-pkg`.
3. `CODIGO 0`.

En la corrida del 17-10-2026, Alpine tenía 1 hallazgo medio y 0 críticos. Los paquetes Node de la imagen sumaban 25 altos, 11 medios y 0 críticos. Parte de esos altos está en herramientas de npm que vienen dentro de la imagen. El archivo queda en `evidencias\atlas\otras\trivy-api.txt` y también alimenta el INC-05.

Si dice que no encuentra la imagen `atlas-api:latest`, correr `docker images` y repetir el comando con el nombre que aparezca para el servicio `api`.

## 14. OWASP ZAP sobre la pantalla

ZAP guarda el HTML en `evidencias\atlas\otras`. Esa carpeta está en la raíz del repositorio, dos niveles más arriba de `codigo\atlas`. Desde el prompt que termina en `\atlas`:

```powershell
cd ..\..
docker run --rm -v "${PWD}\evidencias\atlas\otras:/zap/wrk:rw" ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t http://host.docker.internal:8080 -I -r zap-pantalla.html 2>&1 | Tee-Object -FilePath .\evidencias\atlas\otras\zap-consola.txt
Write-Output "CODIGO $LASTEXITCODE"
```

`host.docker.internal` es la forma en que el contenedor de ZAP llega a la pantalla que está en este equipo, en el puerto 8080. La bandera `-I` hace que los avisos no corten el comando. La primera vez descarga la imagen y el análisis tarda alrededor de dos minutos.

Qué esperar:

1. Un avance del spider y del análisis pasivo.
2. Al final, `FAIL-NEW: 0`, `WARN-NEW: 8` y `PASS: 59`. Esos números pueden moverse un poco en otra corrida.
3. `CODIGO 0`.
4. El archivo `evidencias\atlas\otras\zap-pantalla.html`. Se abre con el navegador.

En la corrida del 17-10-2026 los avisos eran de la pantalla publicada por nginx: faltan X-Frame-Options, X-Content-Type-Options y Content-Security-Policy, y el encabezado Server muestra la versión. Es el INC-06, moderado y abierto. Para seguir con otro comando dentro de Atlas, volver con `cd codigo\atlas`.

## 15. Qué no cubre esta corrida

Siguen fuera de estas pruebas: HTTPS fuera de localhost (INC-03), el correo de verificación (INC-04), la disponibilidad de 99,5 % y la prueba con adultos mayores. SonarQube, ESLint y JMeter no están instalados en este equipo. La carga se mide con el paso 11.

## 16. Códigos que parecen error y no lo son

| Código que aparece | Paso | Qué significa |
|---|---|---|
| `CODIGO 99` | 11, k6 | La prueba terminó. El p95 pasó de 300 ms |
| `CODIGO 1` | 12, npm audit | El informe se generó y hay vulnerabilidades |
| `CODIGO 0` | 13 y 14 | Trivy y ZAP terminaron |
| `Unable to find image` | 11, 13 o 14 | Docker está descargando la herramienta |
| Texto rojo en PowerShell | cualquiera | Aviso de Docker. Leer el final de la salida |
