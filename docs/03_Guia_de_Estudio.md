# Guía de estudio — Atlas · defensa EP4

**Integrantes:** Alison Aranda · Macarena Muñoz · Camilo Romero  
**Ramo:** ISY1102 Seguridad y Calidad en el Desarrollo de Software  
**Docente:** Mauricio Velásquez · Sección ISY1102  
**Fecha de la ejecución:** 17 de octubre de 2026

La defensa es individual. El orden de la presentación es Camilo, Alison y Macarena, pero cualquiera debe poder explicar el sistema, los tipos de prueba, la ejecución, un incidente y la ética.

---

# 1. Qué se hizo, en una página

1. La EP01 diseñó el plan sobre **Atlas** (CreaLab Spa).
2. El ERS oficial es `docs/ERS_Atlas_EP1.pdf`, versión 1.1.
3. Se construyó el software local en `codigo/atlas`: pantalla React, API Express y PostgreSQL, todo con Docker.
4. El 17-10-2026 se ejecutaron los casos contra http://localhost:3010. Quedaron 15 resultados correctos.
5. El informe está en `entrega/Informe_EP3_Atlas.docx` y la presentación en `entrega/Presentacion_EP4_Atlas.pptx`.
6. El paso a paso para repetirlo está en `docs/04_Paso_a_Paso.md`. El script es `codigo/atlas/probar.ps1`.
7. El repositorio público es https://github.com/milotkg2/seguridad-calidad-software-ev2-atlas

**Frase de 20 segundos.** Atlas es la plataforma de CreaLab para que una pyme gestione clientes, contratos y documentos. Probamos el login, que el editor no pueda escribir, la baja lógica y el documento del contrato CT-0012. Cumple esos requisitos. La carga de 200 usuarios y el HTTPS fuera del computador local siguen abiertos.

---

# 2. Atlas en 60 segundos

| Dato | Valor |
|---|---|
| Qué es | Gestión de clientes, contratos y documentos para pymes en Chile |
| Quién lo pide | CreaLab Spa, ERS v1.1 (Roberto Araya, 13-04-2026) |
| Roles | Administrador escribe. Editor solo lee (RB-4 y RB-5) |
| Módulos | RF-1 sesión · RF-2 empresa · RF-3 usuarios · RF-4 clientes · RF-5 contratos y documentos · RF-6 auditoría |
| Usuarios de prueba | `jperez` administrador · `editor1` editor · contraseña `Clave#Segura2026` |
| Datos sembrados | Empresa CreaLab Spa (id 1), cliente Distribuidora Andina SpA (id 101), contrato CT-0012 |
| Pantalla | http://localhost:8080 |
| API | http://localhost:3010 · Swagger en `/api/docs` |

Umbrales del ERS que hay que memorizar, aunque no todos se midieron:

- Operación CRUD simple: menos de 300 ms (NFR-PERF-1).
- Página principal: menos de 2 s (NFR-PERF-2).
- 200 usuarios concurrentes (NFR-PERF-3).
- Disponibilidad objetivo: 99,5 % al mes (NFR-DIS-1).
- Contraseña: mínimo 12 caracteres, con mayúscula, minúscula, número y símbolo.

---

# 3. Conceptos que hay que poder definir

| Concepto | Definición | Cómo lo usamos |
|---|---|---|
| Calidad | Grado en que el software cumple requisitos y atributos (ISO/IEC 25010) | Login, baja lógica, estado del contrato |
| Seguridad | Proteger confidencialidad, integridad y disponibilidad | bcrypt, cifrado, RBAC, consultas con parámetros |
| Cumplimiento | Ajuste a leyes y normas | 19.628 / 21.719, 21.663, 20.422 |
| ERS | Especificación de requisitos. Fuente de los RF, NFR y RB | PDF v1.1 de Atlas |
| RF | Requisito funcional: qué hace el sistema | RF-1 a RF-6 |
| NFR | Requisito no funcional: cómo de seguro, rápido o usable | NFR-SEG, PERF, USAB, DIS, COMPAT |
| RB | Regla de negocio | RB-4 editor solo lee; RB-5 administrador escribe |
| Plan de pruebas | Estrategia, alcance, tipos, casos, recursos, criterios y cronograma | Secciones 3 y 4 del informe |
| Caso de prueba | Un escenario con datos, pasos y resultado esperado, trazado a un requisito | CP-FUN-01, CP-FUN-02, CP-INT-01, CP-SEG-01 |
| Trazabilidad | Relación requisito ↔ caso, en los dos sentidos | Tabla 4.2 del informe |
| Evidencia | Resultado legible, con fecha y ejecutor | `evidencias/atlas/ejecucion-api.txt` |
| Incidente | Hallazgo clasificado, con origen, impacto y estado | INC-01 a INC-04 |
| Criticidad | Gravedad según el daño, no según quién programó | Crítico, grave, moderado, leve |
| SAST | Revisión del código o de las dependencias sin atacar la app en marcha | Revisión de `index.js`: parámetros, bcrypt, cifrado |
| DAST | Prueba contra la aplicación encendida | Los HTTP del 17-10-2026 |
| Veredicto | Juicio final con lo cumplido y lo que queda abierto | Cumple el núcleo funcional. Carga y TLS abiertos |

**Entrada de la prueba:** ERS, Docker encendido, usuarios de prueba.  
**Salida:** casos con código HTTP, evidencia guardada e incidentes clasificados.

---

# 4. Tecnologías

| Tecnología | Qué es | En este trabajo |
|---|---|---|
| React 19 | Biblioteca para la pantalla de una sola página | Login, clientes, contratos, usuarios, auditoría y ayuda |
| Express 4.19 | Framework de la API REST | Puerto interno 3000 |
| PostgreSQL 16 | Base relacional | Empresas, usuarios, clientes, contratos, documentos, auditoría |
| JWT | Token firmado de sesión | Acceso de 15 minutos |
| Refresh token | Token para pedir otro acceso sin volver a escribir la clave | 7 días. El logout lo revoca |
| bcrypt | Hash de contraseñas, irreversible, con sal y costo alto | Costo 12. NFR-SEG-2 |
| AES-256-GCM | Cifrado en reposo | Contacto y datos bancarios. NFR-SEG-3 |
| RBAC | Control de acceso por rol | El middleware `exigirEscritura` responde 403 al editor |
| Docker Compose | Levanta varios contenedores juntos | `db`, `api` y `web` |
| Swagger | Documentación viva de la API | http://localhost:3010/api/docs |
| curl / `probar.ps1` | Cliente para repetir las pruebas | 15 comprobaciones |

La pantalla no guarda la contraseña. El log de la API anota método, ruta, código y milisegundos, no el cuerpo ni la clave (NFR-SEG-6).

**Puertos.** En el navegador del equipo: pantalla 8080 y API 3010. Dentro de Docker la API escucha en el 3000. El 3010 existe porque el 3000 ya lo usaba otro proyecto (INC-01).

---

# 5. Requisitos y qué se demostró

| Código | Exige | Resultado del 17-10-2026 |
|---|---|---|
| RF-1.1 | Login con usuario y contraseña | 200 y token para `jperez` |
| RF-1.2 | Cerrar sesión y revocar el token | Logout 200 |
| RF-2 | Registro y creación de empresa; el primero queda administrador | Implementado. No fue el foco de la corrida |
| RF-3 | El administrador crea usuarios y asigna rol | Implementado en la pantalla y en la API |
| RF-4.1 / RF-4.2 | Crear, listar y baja lógica de clientes | Alta 201, baja lógica 200, después 404 |
| RF-4.3 | Validar campos | Nombre obligatorio. Contraseña con la política del ERS |
| RF-5.1 | Contrato de un cliente, con inicio y término | CT-0012, estado activo |
| RF-5.2 / RF-5.3 | Adjuntar PDF, DOC, PPT, JPG o PNG y referenciarlo | Subida 201. El archivo va al storage, la base guarda la referencia |
| RF-5.4 | Estado activo, vence o expirado según las fechas | CT-0012 salió activo |
| RF-5.5 | Enlace para compartir el documento | 201, enlace de 7 días |
| RF-6.1 | Auditar altas, bajas, subidas y descargas | La auditoría mostró crear, eliminar, subir y compartir |
| RB-2 | Solo quien pertenece a la empresa ve sus datos | El middleware exige la fila en `empresa_usuarios` |
| RB-3 | Un contrato pertenece a un solo cliente | El contrato tiene un `cliente_id` |
| RB-4 / NFR-SEG-4 | El editor solo lee, y el control está en el backend | POST y DELETE del editor: **403** |
| RB-5 | El administrador escribe | `jperez` creó y dio de baja |
| NFR-SEG-1 | TLS en todas las comunicaciones | Abierto. En localhost el tráfico es HTTP (INC-03) |
| NFR-SEG-5 | Evitar inyección SQL y validar archivos | Consultas con `$1`, `$2`. Tipos de archivo limitados |
| NFR-PERF-3 | 200 usuarios concurrentes | Ejecutado con k6: 0 % de error, p95 = 1,28 s (sobre 300 ms) |
| NFR-USAB-4 | Primero el cliente y después sus contratos | La pantalla entra al cliente y desde ahí abre el contrato |

Si preguntan por la cobertura: los casos ejecutados cubren el núcleo del ERS. No hay una matriz del 100 % de cada NFR. La carga sí se midió y el p95 no cumple. Eso se dice con veracidad, no se inventa un porcentaje.

---

# 6. Casos, para decirlos de memoria

| ID | En una frase | Prueba | Esperado | Obtenido |
|---|---|---|---|---|
| CP-FUN-01 | Login válido | `jperez` / `Clave#Segura2026` | 200 y JWT | 200 |
| — | Clave mala | Contraseña incorrecta | 401 | 401 |
| CP-SEG-01 | El editor no escribe | POST y DELETE con `editor1` | 403 | 403 en los dos |
| CP-FUN-02 | Baja lógica | DELETE con el administrador | Marca eliminado, no borra la fila | 200 y luego 404 |
| CP-INT-01 | Documento | Archivo al contrato CT-0012 y enlace | 201 y referencia | 201 y enlace |
| RF-6 | Auditoría | GET de la auditoría de la empresa 1 | Filas de las acciones críticas | 200 |
| CP-PERF-01 | Carga | 200 usuarios, p95 bajo 300 ms | Umbral del ERS | 0 % error y p95 = 1,28 s. No cumple el tiempo |
| CP-USA-01 | Recorrido | Cliente y después contrato | Flujo del ERS | Hecho en la pantalla |

El script `probar.ps1` resume esa corrida: **15 correctas, 0 fallidas**.

---

# 7. Tipos de prueba: origen e impacto

Esta tabla es la de más peso en la defensa. Hay que decir el origen y qué pasa si no se hace.

| Tipo | Origen | Si no se hace |
|---|---|---|
| Funcional de login | RF-1.1 | No se sabe si la sesión nace |
| Seguridad RBAC | RB-4 y NFR-SEG-4. El control de la pantalla no basta | El editor crea o borra clientes con una llamada directa |
| Baja lógica | RF-4.2 | El cliente desaparece de verdad y se pierde el historial |
| Integración del documento | RF-5 y RF-6 | El archivo se ve en pantalla y no queda en storage ni en auditoría |
| Rendimiento | NFR-PERF-1 y NFR-PERF-3 | No se acredita el tiempo ni los 200 usuarios |
| Usabilidad | NFR-USAB-4 y adultos mayores | La persona no llega del cliente al contrato |
| Revisión estática | NFR-SEG-5 | Una consulta armada con texto del usuario permite inyección |

---

# 8. Incidentes

| ID | Nivel | Qué pasó | Estado |
|---|---|---|---|
| INC-01 | Moderado | El puerto 3000 estaba ocupado. La API quedó en 3010 | Cerrado en el README y en el paso a paso |
| INC-02 | Grave | 200 usuarios, 0 % de error, pero p95 = 1,28 s (el ERS pide menos de 300 ms) | Abierto |
| INC-03 | Moderado | En el computador local no hay HTTPS | Abierto para un despliegue real |
| INC-04 | Moderado | El ERS supone correo de verificación y no está hecho | Abierto |
| INC-05 | Grave | npm audit y Trivy: vulnerabilidades altas en Express y en paquetes Node. El parche sube Express a 4.22.3 | Abierto |
| INC-06 | Moderado | ZAP: 0 fallos y 8 avisos de cabeceras en la pantalla nginx | Abierto |

Escala, por si preguntan con otro ejemplo:

- **Crítico:** se cae el login o cualquiera borra clientes.
- **Grave:** el daño es fuerte y el sistema aún se puede usar, o no se puede demostrar un umbral esencial. INC-02 está aquí.
- **Moderado:** duele, y hay forma de seguir. INC-01, INC-03 e INC-04.
- **Leve:** cosmético.

---

# 9. Análisis estático, sin inventar herramientas

Lo que sí se revisó en el código de la API:

- Las escrituras pasan por el rol. Si no es administrador, responde 403.
- Las consultas usan parámetros, no concatenan el texto del usuario.
- La contraseña se guarda con bcrypt.
- Contacto y datos bancarios se cifran antes de entrar a la base.
- El log no imprime la contraseña.

Lo que sí se ejecutó además de la lectura del código: `npm audit` (7 hallazgos, 3 altos), Trivy (0 críticas en Alpine, 25 altos en paquetes Node) y OWASP ZAP (0 fallos nuevos, 8 avisos en la pantalla). SonarQube no está instalado y no se declara.

**Diferencia lista para decir.** La revisión estática lee el código. La prueba dinámica llama a la API encendida. El 403 no se dio por leído: se envió el POST del editor y volvió 403.

---

# 10. Ética, leyes y veredicto

| Principio | En esta prueba |
|---|---|
| Confidencialidad | Clientes y claves son de prueba. La contraseña solo vale en este Docker |
| Veracidad | Se informa el 403 y el p95 de 1,28 s, que no cumple |
| Divulgación responsable | Los hallazgos son para el equipo y el docente |
| No maleficencia | No se ataca otro sistema |
| Mejora continua | Cada incidente abierto tiene una acción en la sección 8 |

| Norma | Vínculo |
|---|---|
| Ley 19.628, actualizada por la 21.719 | Datos personales y bancarios del cliente |
| Ley 21.663 | Ciberseguridad: acceso, cifrado, registro |
| Ley 20.422 | Inclusión. Pantalla con contraste y botones grandes. No hubo prueba con cinco adultos mayores |

**Veredicto.** Atlas en local cumple login, RBAC, baja lógica, documento y auditoría. La carga se midió: 0 % de error y p95 de 1,28 s, sobre los 300 ms. Tampoco están cerrados el TLS ni las vulnerabilidades altas. Se puede seguir en ambiente de prueba. No se declara listo para producción mientras INC-02, INC-03 e INC-05 sigan abiertos.

**Recomendaciones, en orden.** Bajar el p95 bajo 300 ms y volver a medir. Publicar solo por HTTPS fuera del localhost. Agregar el correo de verificación. Planificar el parche de Express y las cabeceras de la pantalla. Mantener el 403 en el backend aunque la pantalla oculte el botón.

---

# 11. Quién habla en los 8 minutos

| Minuto | Quién | Diapositivas | Qué dice |
|---|---|---|---|
| 0:00–2:40 | Camilo | 1 a 4 | Qué es Atlas, el ERS y el paso de la EP01 a la ejecución |
| 2:40–5:20 | Alison | 5 a 9 | Estrategia, origen e impacto, herramientas, códigos HTTP y Docker |
| 5:20–8:00 | Macarena | 10 a 13 | Incidentes, ética, leyes, recomendaciones y veredicto |

El texto para leer está en `docs/02_Guion_Oral.md`.

---

# 12. Posibles preguntas y una respuesta corta

**1. ¿Por qué Atlas y no otro sistema?**  
Porque la EP01 y el ERS del grupo son de Atlas, la plataforma de CreaLab para clientes y contratos.

**2. ¿Qué es el ERS y para qué les sirvió?**  
Es la especificación v1.1. De ahí salen los RF, los NFR y las reglas. Cada caso apunta a un código de ese documento.

**3. ¿Por qué el enfoque no fue solo manual?**  
El recorrido de la pantalla se mira. El login, el 403 y la baja se repiten con el script para que otra persona obtenga el mismo código HTTP.

**4. ¿Cuál es el origen de CP-SEG-01?**  
El ERS dice que el editor solo lee (RB-4) y que el control está en el backend (NFR-SEG-4). Probar el botón no alcanza: hay que llamar a la API.

**5. ¿Qué impacto tiene saltarse esa prueba?**  
El editor podría crear o borrar clientes con una herramienta externa. Eso afecta datos personales. Ley 19.628 / 21.719.

**6. ¿El control en la pantalla basta?**  
No. La pantalla puede ocultar el botón y la API seguir aceptando el DELETE. Por eso el 403 se midió en el backend.

**7. ¿Borrar un cliente lo saca de la base?**  
No. Es baja lógica: se marca eliminado, desaparece del listado y queda en la auditoría. Después el GET responde 404.

**8. ¿Qué pasó el 17 de octubre?**  
Quince comprobaciones correctas. Login 200, clave mala 401, editor 403, alta 201, baja lógica 200, cliente ya no visible 404, documento y enlace 201, auditoría y logout 200.

**9. ¿Dónde está la evidencia?**  
En `evidencias/atlas/ejecucion-api.txt` y en las figuras del informe. La fecha es 17-10-2026.

**10. ¿Qué es un JWT?**  
Un token firmado que la API entrega al login y que el cliente devuelve en `Authorization: Bearer`. El de acceso dura 15 minutos. El logout lo revoca.

**11. ¿Por qué bcrypt y no guardar la clave?**  
Para que una copia de la base no revele la contraseña. bcrypt aplica sal y un costo alto. Es el NFR-SEG-2.

**12. ¿Qué datos van cifrados?**  
El contacto y los datos bancarios, con AES-256-GCM, antes de guardarlos. Es el NFR-SEG-3.

**13. ¿Qué diferencia la revisión estática de la prueba dinámica?**  
La estática lee el código: parámetros, bcrypt, rol. La dinámica llama a la API encendida y mira el 200 o el 403.

**14. ¿Usaron ZAP, Sonar o npm audit?**  
npm audit, Trivy y ZAP sí, el 17-10-2026. SonarQube no está instalado. npm audit: 7 hallazgos, 3 altos. Trivy: 0 críticas en Alpine y 25 altos en paquetes Node. ZAP: 0 fallos nuevos y 8 avisos de cabeceras en la pantalla.

**15. ¿Por qué la API está en el puerto 3010?**  
Porque el 3000 ya estaba ocupado. Es el INC-01, moderado y cerrado: el README y el paso a paso avisan el puerto.

**16. ¿Cumplen los 200 usuarios?**  
Se corrieron 200 usuarios durante 20 segundos con k6. Ninguna petición falló. El p95 fue 1,28 s y el ERS pide menos de 300 ms. INC-02 sigue abierto.

**17. ¿Y el HTTPS?**  
El ERS pide TLS (NFR-SEG-1). En este computador el tráfico es HTTP a localhost. INC-03, abierto para un despliegue real.

**18. ¿Qué ley aplica al RUT y a la cuenta bancaria del cliente?**  
Protección de datos personales: ley 19.628, actualizada por la 21.719.

**19. ¿Qué aporta la 21.663?**  
El marco de ciberseguridad: controlar el acceso, cifrar y registrar las acciones críticas.

**20. ¿Por qué no ocultar el INC-02?**  
Por veracidad. La evaluación pide detectar y clasificar, no dejar el informe todo en verde.

**21. Den una recomendación completa.**  
Hallazgo: el listado con 200 usuarios tiene p95 de 1,28 s. Evidencia: `evidencias/atlas/otras/k6-carga.txt`, 0 % de error. Impacto: no se acredita el umbral de 300 ms. Acción: optimizar el listado y volver a medir. Prioridad alta. Norma: NFR-PERF-1 y NFR-PERF-3.

**22. ¿Quién puede explicar la estrategia?**  
Cualquiera. Camilo la abre, Alison muestra los números y Macarena cierra con ética y veredicto.

**23. ¿Cómo lo vuelve a correr otra persona?**  
Docker Desktop, `cd codigo\atlas`, `docker compose up -d --build`, y `powershell -ExecutionPolicy Bypass -File .\probar.ps1`.

**24. ¿Qué queda sembrado si borro los volúmenes?**  
`docker compose down -v` y al volver a subir aparecen de nuevo `jperez`, `editor1`, el cliente 101 y el contrato CT-0012.

**25. ¿El contrato CT-0012 qué estado tiene y por qué?**  
Activo. El término es el 31-12-2026 y, a la fecha de la prueba, faltaban más de 30 días. Si faltaran 30 días o menos sería «vence». Si la fecha ya pasó, «expirado».

---

# 13. Checklist antes de entrar

- [ ] Explico Atlas, los dos roles y los seis RF en un minuto.
- [ ] Digo de memoria los códigos 200, 401, 403, 201 y 404 y a qué caso pertenecen.
- [ ] Explico el origen y el impacto de CP-SEG-01.
- [ ] Distingo baja lógica de borrado físico.
- [ ] Distingo revisión del código y prueba contra la API encendida.
- [ ] Cito la 19.628 / 21.719 y la 21.663 con un dato de Atlas.
- [ ] Digo INC-02 en voz alta, con nivel grave y estado abierto.
- [ ] Cierro con el veredicto: la carga se midió, el p95 no cumple y el HTTPS sigue abierto.
- [ ] Sé levantar Docker y correr `probar.ps1`.
