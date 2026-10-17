package cl.duoc.alumnos.domain.exception;

/** Se lanza cuando se intenta registrar un RUT que ya existe. */
public class AlumnoDuplicadoException extends RuntimeException {

  public AlumnoDuplicadoException(String rut) {
    super("Ya existe un alumno registrado con el RUT " + rut);
  }
}
