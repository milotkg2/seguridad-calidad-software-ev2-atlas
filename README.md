# EV2 — Atlas · Evaluación Parcial N.º 2 (ISY1102)

Entrega de **Seguridad y Calidad en el Desarrollo de Software** sobre **Atlas** (CreaLab Spa): clientes, contratos y documentos.

**Alison Aranda · Macarena Muñoz · Camilo Romero** · Sección ISY1102 · Docente: Mauricio Velásquez

## Qué hay en el repositorio

| Ruta | Contenido |
|---|---|
| `docs/ERS_Atlas_EP1.pdf` | ERS oficial v1.1 |
| `entrega/Informe_EP3_Atlas.docx` | Informe grupal |
| `entrega/Presentacion_EP4_Atlas.pptx` | Defensa |
| `codigo/atlas/` | Software local (React, Express, PostgreSQL) |
| `evidencias/atlas/ejecucion-api.txt` | Resultado HTTP del 17-10-2026 |

## Arranque

```bash
cd codigo/atlas
docker compose up -d --build
```

| Recurso | URL |
|---|---|
| Pantalla | http://localhost:8080 |
| API | http://localhost:3010 |
| Swagger | http://localhost:3010/api/docs |

Usuarios de prueba, contraseña `Clave#Segura2026`: `jperez` (administrador) y `editor1` (solo lectura). El puerto de la API en el equipo es **3010**.

Datos sembrados: cliente Distribuidora Andina SpA (id 101) y contrato CT-0012.
