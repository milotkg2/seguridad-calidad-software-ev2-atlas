package cl.duoc.alumnos.infrastructure.entrypoints.rest.dto;

import static org.assertj.core.api.Assertions.assertThat;

import cl.duoc.alumnos.domain.model.Alumno;
import java.time.LocalDateTime;
import java.util.Map;
import org.junit.jupiter.api.Test;

class DtoTest {

  @Test
  void alumnoRequestGettersSettersYToDomain() {
    AlumnoRequest request = new AlumnoRequest();
    request.setRut("1-9");
    request.setNombres("Ana");
    request.setApellidos("Pérez");
    request.setEmail("a@duocuc.cl");
    request.setCarrera("Informática");
    request.setEdad(20);

    assertThat(request.getRut()).isEqualTo("1-9");
    assertThat(request.getNombres()).isEqualTo("Ana");
    assertThat(request.getApellidos()).isEqualTo("Pérez");
    assertThat(request.getEmail()).isEqualTo("a@duocuc.cl");
    assertThat(request.getCarrera()).isEqualTo("Informática");
    assertThat(request.getEdad()).isEqualTo(20);

    Alumno alumno = request.toDomain();

    assertThat(alumno.getId()).isNull();
    assertThat(alumno.getRut()).isEqualTo("1-9");
    assertThat(alumno.getNombres()).isEqualTo("Ana");
    assertThat(alumno.getApellidos()).isEqualTo("Pérez");
    assertThat(alumno.getEmail()).isEqualTo("a@duocuc.cl");
    assertThat(alumno.getCarrera()).isEqualTo("Informática");
    assertThat(alumno.getEdad()).isEqualTo(20);
  }

  @Test
  void alumnoResponseGettersSettersYFromDomain() {
    AlumnoResponse response =
        AlumnoResponse.fromDomain(
            new Alumno(1L, "1-9", "Ana", "Pérez", "a@duocuc.cl", "Informática", 20));

    assertThat(response.getId()).isEqualTo(1L);
    assertThat(response.getRut()).isEqualTo("1-9");
    assertThat(response.getNombres()).isEqualTo("Ana");
    assertThat(response.getApellidos()).isEqualTo("Pérez");
    assertThat(response.getEmail()).isEqualTo("a@duocuc.cl");
    assertThat(response.getCarrera()).isEqualTo("Informática");
    assertThat(response.getEdad()).isEqualTo(20);

    AlumnoResponse otro = new AlumnoResponse();
    otro.setId(2L);
    otro.setRut("2-7");
    otro.setNombres("Luis");
    otro.setApellidos("Gómez");
    otro.setEmail("l@duocuc.cl");
    otro.setCarrera("Informática");
    otro.setEdad(23);

    assertThat(otro.getId()).isEqualTo(2L);
    assertThat(otro.getRut()).isEqualTo("2-7");
    assertThat(otro.getNombres()).isEqualTo("Luis");
    assertThat(otro.getApellidos()).isEqualTo("Gómez");
    assertThat(otro.getEmail()).isEqualTo("l@duocuc.cl");
    assertThat(otro.getCarrera()).isEqualTo("Informática");
    assertThat(otro.getEdad()).isEqualTo(23);
  }

  @Test
  void errorResponseGettersSetters() {
    ErrorResponse error = new ErrorResponse(404, "Not Found", "mensaje", "/ruta");

    assertThat(error.getStatus()).isEqualTo(404);
    assertThat(error.getError()).isEqualTo("Not Found");
    assertThat(error.getMessage()).isEqualTo("mensaje");
    assertThat(error.getPath()).isEqualTo("/ruta");
    assertThat(error.getTimestamp()).isNotNull();

    LocalDateTime ahora = LocalDateTime.now();
    error.setTimestamp(ahora);
    error.setStatus(500);
    error.setError("Error");
    error.setMessage("otro");
    error.setPath("/otra");
    error.setDetails(Map.of("campo", "detalle"));

    assertThat(error.getTimestamp()).isEqualTo(ahora);
    assertThat(error.getStatus()).isEqualTo(500);
    assertThat(error.getError()).isEqualTo("Error");
    assertThat(error.getMessage()).isEqualTo("otro");
    assertThat(error.getPath()).isEqualTo("/otra");
    assertThat(error.getDetails()).containsEntry("campo", "detalle");
  }
}
