package cl.duoc.alumnos.domain.gateway;

import cl.duoc.alumnos.domain.model.Alumno;
import java.util.List;
import java.util.Optional;

/**
 * Puerto de salida (gateway) del dominio. Define QUE necesita el dominio, no COMO se implementa.
 */
public interface AlumnoGateway {

  List<Alumno> findAll();

  Optional<Alumno> findById(Long id);

  Optional<Alumno> findByRut(String rut);

  Alumno save(Alumno alumno);

  void deleteById(Long id);
}
