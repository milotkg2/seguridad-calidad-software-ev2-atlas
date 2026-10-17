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

## 11. Carga con k6 (CP-PERF-01)

Hace falta que la API ya esté en http://localhost:3010. Desde `codigo\atlas`:

```powershell
docker run --rm -v "${PWD}\pruebas:/scripts" grafana/k6 run /scripts/carga.js
```

El script `pruebas\carga.js` entra como `jperez` y, con 200 usuarios durante 20 segundos, consulta el listado de clientes de la empresa 1. Los umbrales pedidos son menos de 1 % de error y p95 menor a 300 ms.

En la corrida del 17 de octubre de 2026 el resultado fue:

- 4428 peticiones
- 0 % de error
- p95 = 1,28 s

k6 termina con código 99 cuando un umbral no se cumple. En este caso falló el tiempo, no la herramienta. Guardar la salida en `evidencias\atlas\otras\k6-carga.txt`. Es el INC-02, grave y abierto.

## 12. npm audit

Con el contenedor `atlas-api-1` en marcha:

```powershell
docker exec atlas-api-1 npm audit --audit-level=low
```

El comando sale con código 1 si encuentra vulnerabilidades. En la corrida del 17-10-2026 hubo 7: 3 altas, 1 moderada y 3 bajas, en Express 4.19.2 y en body-parser, cookie, path-to-regexp, qs y send. El arreglo que propone npm instala Express 4.22.3, fuera de la versión fijada. El log está en `evidencias\atlas\otras\npm-audit-api.txt`. Es parte del INC-05.

## 13. Trivy sobre la imagen

La imagen tiene que existir (`docker compose up -d --build` ya la crea):

```powershell
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --severity CRITICAL,HIGH,MEDIUM --no-progress atlas-api:latest
```

En la corrida del 17-10-2026:

- Alpine 3.24.2: 1 media (zlib). 0 críticas y 0 altas del sistema operativo.
- Paquetes Node de la imagen: 25 altos, 11 medios y 0 críticos.

El log está en `evidencias\atlas\otras\trivy-api.txt`. También alimenta el INC-05. Parte de los altos está en herramientas de npm que vienen dentro de la imagen, no solo en el código de Atlas.

## 14. OWASP ZAP sobre la pantalla

Desde la raíz del repositorio, con http://localhost:8080 abierto:

```powershell
docker run --rm -v "${PWD}\evidencias\atlas\otras:/zap/wrk:rw" ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t http://host.docker.internal:8080 -I -r zap-pantalla.html
```

La bandera `-I` evita que los avisos corten el comando. En la corrida del 17-10-2026: 0 fallos nuevos, 8 avisos y 59 controles en orden. Los avisos son de la pantalla publicada por nginx: faltan X-Frame-Options, X-Content-Type-Options y Content-Security-Policy, y el encabezado Server muestra la versión. La API envía cabeceras más estrictas. El HTML queda en `evidencias\atlas\otras\zap-pantalla.html`. Es el INC-06, moderado y abierto.

## 15. Qué no cubre esta corrida

Siguen fuera de estas pruebas: HTTPS fuera de localhost (INC-03), el correo de verificación (INC-04), la disponibilidad de 99,5 % y la prueba con adultos mayores. SonarQube, ESLint y JMeter no están instalados en este equipo. La carga se midió con k6, que entrega usuarios concurrentes y percentil 95.
