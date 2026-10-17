package cl.duoc.alumnos.domain.model;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class AlumnoTest {

  private Alumno alumno() {
    return new Alumno(1L, "12.345.678-9", "Ana", "Pérez", "ana@duocuc.cl", "Informática", 21);
  }

  @Test
  void gettersYSettersFuncionan() {
    Alumno a = new Alumno();
    a.setId(5L);
    a.setRut("1-9");
    a.setNombres("Ana");
    a.setApellidos("Pérez");
    a.setEmail("a@duocuc.cl");
    a.setCarrera("Informática");
    a.setEdad(20);

    assertThat(a.getId()).isEqualTo(5L);
    assertThat(a.getRut()).isEqualTo("1-9");
    assertThat(a.getNombres()).isEqualTo("Ana");
    assertThat(a.getApellidos()).isEqualTo("Pérez");
    assertThat(a.getEmail()).isEqualTo("a@duocuc.cl");
    assertThat(a.getCarrera()).isEqualTo("Informática");
    assertThat(a.getEdad()).isEqualTo(20);
  }

  @Test
  void equalsEsVerdaderoParaElMismoObjeto() {
    Alumno a = alumno();

    assertThat(a.equals(a)).isTrue();
  }

  @Test
  void equalsEsFalsoParaOtroTipoONulo() {
    Alumno a = alumno();

    assertThat(a.equals("otro")).isFalse();
    assertThat(a.equals(null)).isFalse();
  }

  @Test
  void equalsComparaIdYRut() {
    assertThat(alumno()).isEqualTo(alumno());

    Alumno distinto =
        new Alumno(2L, "12.345.678-9", "Ana", "Pérez", "ana@duocuc.cl", "Informática", 21);

    assertThat(alumno()).isNotEqualTo(distinto);
  }

  @Test
  void hashCodeEsConsistente() {
    assertThat(alumno().hashCode()).isEqualTo(alumno().hashCode());
  }
}
