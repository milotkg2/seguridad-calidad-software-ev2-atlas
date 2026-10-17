# Atlas — código local (ERS EP1)

Sistema de gestión de clientes, contratos y documentos de **CreaLab Spa**, según `docs/ERS_Atlas_EP1.pdf`.

Stack del ERS: React 19, Express 4.19, PostgreSQL 16, JWT, bcrypt y control de acceso en el backend.

## Levantar

Desde esta carpeta, con Docker Desktop:

```bash
docker compose up -d --build
```

| Qué | Dónde |
|---|---|
| Aplicación | http://localhost:8080 |
| API | http://localhost:3010 |
| Swagger | http://localhost:3010/api/docs |
| Salud | http://localhost:3010/api/salud |

El puerto del host es **3010** porque el 3000 ya está ocupado por otro proyecto. Dentro de Docker la API sigue en el 3000, y la pantalla la llama por `/api`.

## Usuarios de prueba

Contraseña de ambos, solo para este ambiente local: `Clave#Segura2026`

| Usuario | Rol |
|---|---|
| `jperez` | administrador |
| `editor1` | editor (solo lectura; POST y DELETE responden 403) |

Datos sembrados: empresa CreaLab Spa, cliente **Distribuidora Andina SpA** (id 101), contrato **CT-0012**.

## Qué cubre del ERS

- RF-1 login, logout con revocación y refresh token
- RF-2 registro y creación de empresa; el primer usuario queda administrador
- RF-3 usuarios y roles
- RF-4 clientes con filtro, baja lógica y confirmación en pantalla
- RF-5 contratos, estado activo/vence/expirado, documentos en storage y enlace temporal
- RF-6 auditoría de altas, ediciones, bajas, subidas y descargas
- NFR-SEG bcrypt, cifrado en reposo de contacto y datos bancarios, RBAC en API, consultas parametrizadas, cabeceras
- RB-4 editor solo lectura · RB-5 administrador escribe

TLS (NFR-SEG-1) corresponde al despliegue real. En esta máquina el tráfico es HTTP en localhost.

## Apagar

```bash
docker compose down
```
