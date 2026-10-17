package cl.duoc.alumnos.infrastructure.adapters.jpa;

import static org.assertj.core.api.Assertions.assertThat;

import cl.duoc.alumnos.domain.model.Alumno;
import org.junit.jupiter.api.Test;

class AlumnoMapperTest {

  private final AlumnoMapper mapper = new AlumnoMapper();

  @Test
  void toDomainDevuelveNullSiLaEntidadEsNull() {
    assertThat(mapper.toDomain(null)).isNull();
  }

  @Test
  void toDomainCopiaLosCampos() {
    AlumnoData data = new AlumnoData();
    data.setId(1L);
    data.setRut("1-9");
    data.setNombres("Ana");
    data.setApellidos("Pérez");
    data.setEmail("a@duocuc.cl");
    data.setCarrera("Informática");
    data.setEdad(20);

    Alumno alumno = mapper.toDomain(data);

    assertThat(alumno.getId()).isEqualTo(1L);
    assertThat(alumno.getRut()).isEqualTo("1-9");
    assertThat(alumno.getNombres()).isEqualTo("Ana");
    assertThat(alumno.getApellidos()).isEqualTo("Pérez");
    assertThat(alumno.getEmail()).isEqualTo("a@duocuc.cl");
    assertThat(alumno.getCarrera()).isEqualTo("Informática");
    assertThat(alumno.getEdad()).isEqualTo(20);
  }

  @Test
  void toDataDevuelveNullSiElAlumnoEsNull() {
    assertThat(mapper.toData(null)).isNull();
  }

  @Test
  void toDataCopiaLosCampos() {
    Alumno alumno = new Alumno(1L, "1-9", "Ana", "Pérez", "a@duocuc.cl", "Informática", 20);

    AlumnoData data = mapper.toData(alumno);

    assertThat(data.getId()).isEqualTo(1L);
    assertThat(data.getRut()).isEqualTo("1-9");
    assertThat(data.getNombres()).isEqualTo("Ana");
    assertThat(data.getApellidos()).isEqualTo("Pérez");
    assertThat(data.getEmail()).isEqualTo("a@duocuc.cl");
    assertThat(data.getCarrera()).isEqualTo("Informática");
    assertThat(data.getEdad()).isEqualTo(20);
  }
}
