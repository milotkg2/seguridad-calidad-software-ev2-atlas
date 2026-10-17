# Evidencia Atlas — 17 de octubre de 2026

Registro de la corrida contra `http://localhost:3010`.

| Caso | Resultado |
|---|---|
| CP-FUN-01 login `jperez` | 200 |
| Login inválido | 401 |
| CP-SEG-01 editor POST y DELETE | 403 |
| CP-FUN-02 baja lógica | 200 y el cliente ya no se obtiene (404) |
| CP-INT-01 documento CT-0012 y enlace | 201 |
| RF-1.2 logout | 200 |
| RF-6 auditoría | 200 |

El detalle está en `atlas/ejecucion-api.txt`. Las capturas están en `atlas/capturas/`. Los logs de k6, npm audit, Trivy y ZAP están en `atlas/otras/`. La carga de 200 usuarios terminó con 0 % de error y p95 de 1,28 s.
