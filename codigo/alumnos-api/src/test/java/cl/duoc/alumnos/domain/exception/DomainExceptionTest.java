package cl.duoc.alumnos.domain.exception;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class DomainExceptionTest {

  @Test
  void alumnoNotFoundExceptionIncluyeElId() {
    assertThat(new AlumnoNotFoundException(7L).getMessage()).contains("7");
  }

  @Test
  void alumnoDuplicadoExceptionIncluyeElRut() {
    assertThat(new AlumnoDuplicadoException("1-9").getMessage()).contains("1-9");
  }
}
