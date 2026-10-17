package cl.duoc.alumnos.infrastructure.adapters.jpa;

import cl.duoc.alumnos.domain.model.Alumno;
import org.springframework.stereotype.Component;

/** Traduce entre el modelo de dominio y la entidad de persistencia. */
@Component
public class AlumnoMapper {

  public Alumno toDomain(AlumnoData data) {
    if (data == null) {
      return null;
    }
    return new Alumno(
        data.getId(),
        data.getRut(),
        data.getNombres(),
        data.getApellidos(),
        data.getEmail(),
        data.getCarrera(),
        data.getEdad());
  }

  public AlumnoData toData(Alumno alumno) {
    if (alumno == null) {
      return null;
    }
    AlumnoData data = new AlumnoData();
    data.setId(alumno.getId());
    data.setRut(alumno.getRut());
    data.setNombres(alumno.getNombres());
    data.setApellidos(alumno.getApellidos());
    data.setEmail(alumno.getEmail());
    data.setCarrera(alumno.getCarrera());
    data.setEdad(alumno.getEdad());
    return data;
  }
}
