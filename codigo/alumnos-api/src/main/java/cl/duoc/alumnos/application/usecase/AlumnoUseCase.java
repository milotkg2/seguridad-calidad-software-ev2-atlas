package cl.duoc.alumnos.application.usecase;

import cl.duoc.alumnos.domain.exception.AlumnoDuplicadoException;
import cl.duoc.alumnos.domain.exception.AlumnoNotFoundException;
import cl.duoc.alumnos.domain.gateway.AlumnoGateway;
import cl.duoc.alumnos.domain.model.Alumno;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Casos de uso del CRUD de alumnos. Orquesta las reglas de negocio y depende solo del puerto
 * (AlumnoGateway).
 */
@Service
public class AlumnoUseCase {

  private final AlumnoGateway alumnoGateway;

  public AlumnoUseCase(AlumnoGateway alumnoGateway) {
    this.alumnoGateway = alumnoGateway;
  }

  public List<Alumno> listar() {
    return alumnoGateway.findAll();
  }

  public Alumno obtener(Long id) {
    return alumnoGateway.findById(id).orElseThrow(() -> new AlumnoNotFoundException(id));
  }

  public Alumno crear(Alumno alumno) {
    alumnoGateway
        .findByRut(alumno.getRut())
        .ifPresent(
            a -> {
              throw new AlumnoDuplicadoException(alumno.getRut());
            });
    alumno.setId(null);
    return alumnoGateway.save(alumno);
  }

  public Alumno actualizar(Long id, Alumno alumno) {
    Alumno actual = obtener(id);
    alumnoGateway
        .findByRut(alumno.getRut())
        .filter(existente -> !existente.getId().equals(id))
        .ifPresent(
            existente -> {
              throw new AlumnoDuplicadoException(alumno.getRut());
            });

    actual.setRut(alumno.getRut());
    actual.setNombres(alumno.getNombres());
    actual.setApellidos(alumno.getApellidos());
    actual.setEmail(alumno.getEmail());
    actual.setCarrera(alumno.getCarrera());
    actual.setEdad(alumno.getEdad());

    return alumnoGateway.save(actual);
  }

  public void eliminar(Long id) {
    obtener(id);
    alumnoGateway.deleteById(id);
  }
}
