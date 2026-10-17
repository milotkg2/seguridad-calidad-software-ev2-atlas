package cl.duoc.alumnos.bdd;

import cl.duoc.alumnos.domain.gateway.AlumnoGateway;
import cl.duoc.alumnos.domain.model.Alumno;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Implementacion en memoria del puerto AlumnoGateway para las pruebas BDD. Evita levantar base de
 * datos: los escenarios son rapidos y deterministas.
 */
public class InMemoryAlumnoGateway implements AlumnoGateway {

  private final Map<Long, Alumno> datos = new LinkedHashMap<>();
  private long secuencia = 0;

  @Override
  public List<Alumno> findAll() {
    return new ArrayList<>(datos.values());
  }

  @Override
  public Optional<Alumno> findById(Long id) {
    return Optional.ofNullable(datos.get(id));
  }

  @Override
  public Optional<Alumno> findByRut(String rut) {
    return datos.values().stream().filter(a -> a.getRut().equals(rut)).findFirst();
  }

  @Override
  public Alumno save(Alumno alumno) {
    if (alumno.getId() == null) {
      alumno.setId(++secuencia);
    }
    datos.put(alumno.getId(), alumno);
    return alumno;
  }

  @Override
  public void deleteById(Long id) {
    datos.remove(id);
  }
}
