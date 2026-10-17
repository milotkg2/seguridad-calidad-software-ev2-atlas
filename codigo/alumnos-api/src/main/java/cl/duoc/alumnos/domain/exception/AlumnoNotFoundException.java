package cl.duoc.alumnos.domain.exception;

/** Se lanza cuando un alumno no existe. */
public class AlumnoNotFoundException extends RuntimeException {

  public AlumnoNotFoundException(Long id) {
    super("No existe un alumno con id " + id);
  }
}
