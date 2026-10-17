# Guion oral — 8 minutos

**ISY1102 · Atlas · 17 de octubre de 2026**  
Alison Aranda, Macarena Muñoz y Camilo Romero.

Cada persona tiene 2 minutos y 40 segundos. El orden de las diapositivas no se salta. Camilo abre con las 1 a 4, Alison sigue con las 5 a 9 y Macarena cierra con las 10 a 13.

Si se pasan de su bloque, la siguiente persona entra igual. El reloj manda.

| Quién | Tiempo | Diapositivas |
|---|---|---|
| Camilo | 0:00–2:40 | 1, 2, 3 y 4 |
| Alison | 2:40–5:20 | 5, 6, 7, 8 y 9 |
| Macarena | 5:20–8:00 | 10, 11, 12 y 13 |

---

## Camilo — 0:00 a 2:40 — diapositivas 1 a 4

### Diapositiva 1 — unos 25 segundos

Buenos días. Somos Alison Aranda, Macarena Muñoz y yo, Camilo Romero. Defendemos Atlas, la plataforma de CreaLab Spa para clientes, contratos y documentos. El informe es la EP3 y esta presentación es la EP4. La evidencia es del 17 de octubre de 2026.

### Diapositiva 2 — unos 25 segundos

El recorrido es este. Primero el sistema. Después, cómo el plan de la EP01 pasó a ejecución. Alison va a mostrar la estrategia, los tipos de prueba y los resultados. Macarena cierra con incidentes, ética y veredicto. No vamos a decir que todo está en verde.

### Diapositiva 3 — unos 70 segundos

Atlas es una aplicación web. La pantalla es React 19. La API es Express 4.19. La base es PostgreSQL 16. El documento de referencia es el ERS v1.1.

Hay dos roles. El administrador, `jperez`, escribe. El editor, `editor1`, solo lee. Esa regla es la RB-4 y el control está en el backend, no solo en el botón.

Los datos sensibles son el contacto y los datos bancarios del cliente. Van cifrados. Eso se vincula con la ley 19.628. Los módulos que más nos importan son el login, los clientes, los contratos y la auditoría.

### Diapositiva 4 — unos 40 segundos

En la EP01 diseñamos el plan: estrategia, tipos, criterios y ética. En la EP3 ejecutamos ese plan sobre Docker. Hay evidencia HTTP del login, del 403, de la baja lógica y del documento. La meta de la rúbrica es detectar y clasificar, no maquillar. Lo que no cumple lo decimos con el número.

Paso a Alison.

---

## Alison — 2:40 a 5:20 — diapositivas 5 a 9

### Diapositiva 5 — unos 30 segundos

Gracias, Camilo. La estrategia es mixta. Los casos de API se repiten con solicitudes HTTP. La pantalla se revisa en el recorrido de cliente y contrato. La prioridad es autenticación y rol, después clientes, documento y, al final, rendimiento. La entrada es Docker, el ERS y los dos usuarios. La salida incluye el 403, la baja lógica y el p95 de k6: 1,28 segundos.

### Diapositiva 6 — unos 45 segundos

Esta tabla es el origen y el impacto. El login sale del RF-1.1: si no se prueba, no sabemos si nace la sesión. El rol sale de RB-4 y NFR-SEG-4: si solo se mira el botón, el editor puede escribir por API. La baja lógica sale del RF-4.2: si se omite, el cliente se borra de verdad. El documento sale de RF-5 y RF-6: sin la prueba, el archivo se ve y no queda referencia ni auditoría. La carga sale de NFR-PERF-1 y NFR-PERF-3. La usabilidad, del recorrido cliente y luego contrato. La revisión estática, de las consultas parametrizadas.

### Diapositiva 7 — unos 25 segundos

Cada control cubre un requisito. JWT y bcrypt para la sesión. El 403 en el backend para el rol. Cifrado en reposo para contacto y banco. El storage acepta PDF, DOC, PPT, JPG y PNG. La auditoría registra las acciones críticas. El ambiente es Docker: API en el puerto 3010 y pantalla en el 8080. Además anexamos k6, ZAP, npm audit y Trivy.

### Diapositiva 8 — unos 40 segundos

El 17 de octubre, `probar.ps1` dejó 15 comprobaciones correctas. Login de `jperez`: 200 y token. Contraseña mala: 401. Editor en POST y DELETE: 403. Alta de un cliente temporal: 201. Baja lógica: 200, y el GET siguiente: 404. Documento del contrato CT-0012: 201, con archivo en storage y enlace. La auditoría mostró crear, eliminar, subir y compartir.

### Diapositiva 9 — unos 20 segundos

Cualquiera lo reproduce con `docker compose up -d --build` dentro de `codigo\atlas`. Hay tres servicios: API, pantalla y PostgreSQL. La API corre con usuario `node`. Trivy sobre esa imagen no encontró críticas en Alpine. El paso a paso está en el documento del grupo.

Paso a Macarena.

---

## Macarena — 5:20 a 8:00 — diapositivas 10 a 13

### Diapositiva 10 — unos 50 segundos

Gracias, Alison. Tres incidentes para decir en voz alta.

INC-01, moderado y cerrado. El puerto 3000 estaba ocupado, así que la API quedó en 3010. Si alguien llama al 3000, no ve Atlas.

INC-02, grave y abierto. Sí corrimos 200 usuarios durante 20 segundos con k6. Hubo 4428 peticiones y 0 % de error. El p95 fue 1,28 segundos y el ERS pide menos de 300 milisegundos. El umbral de tiempo no se cumple.

INC-03, moderado y abierto. En este computador el tráfico es HTTP. TLS corresponde a un despliegue real.

También quedaron abiertos el correo de verificación, las vulnerabilidades altas de Express que vieron npm audit y Trivy, y ocho avisos de ZAP en las cabeceras de la pantalla. ZAP no marcó fallos nuevos.

### Diapositiva 11 — unos 40 segundos

En ética: los clientes son de prueba, los escaneos fueron solo en este Docker y el informe dice el p95 real, no un «cumple». En normativa: la ley 19.628 y la 21.719 cubren contacto y datos bancarios. La 21.663 pide controlar el acceso, cifrar y registrar. La 20.422 se refleja en contraste y botones grandes, sin prueba formal con adultos mayores.

### Diapositiva 12 — unos 35 segundos

Las recomendaciones, en orden. Primero, bajar el p95 del listado bajo 300 milisegundos y volver a medir. Segundo, publicar Atlas solo por HTTPS fuera de localhost. Tercero, el correo de verificación del ERS. Cuarto, planificar el parche de Express y las cabeceras que marcó ZAP. Quinto, mantener el 403 en el backend aunque la pantalla oculte el botón.

### Diapositiva 13 — unos 35 segundos

Veredicto. Atlas cumple login, RBAC, baja lógica, documento y auditoría. No está listo para producción: siguen abiertos el p95 de 1,28 segundos, el TLS y las vulnerabilidades altas. Se puede seguir en ambiente de prueba. Gracias. Quedamos atentos a las preguntas.
