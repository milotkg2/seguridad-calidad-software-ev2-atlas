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
