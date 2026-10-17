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
| `docs/04_Paso_a_Paso.md` y `entrega/Paso_a_Paso_Atlas.docx` | Cómo levantar Docker y repetir las pruebas |
| `docs/03_Guia_de_Estudio.md` y `entrega/Guia_de_Estudio_Atlas.docx` | Conceptos, tecnologías y preguntas de la defensa |
| `docs/02_Guion_Oral.md` y `entrega/Guion_Oral_Atlas.docx` | Guion de 8 minutos: Camilo, Alison y Macarena |
| `evidencias/atlas/capturas/` | Capturas de la pantalla, la API y las herramientas |
| `evidencias/atlas/otras/` | Logs de k6, npm audit, Trivy y ZAP |

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
