package cl.duoc.alumnos.infrastructure.entrypoints.rest.dto;

import cl.duoc.alumnos.domain.model.Alumno;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Alumno devuelto por la API")
public class AlumnoResponse {

  @Schema(description = "Identificador", example = "1")
  private Long id;

  @Schema(example = "12.345.678-9")
  private String rut;

  @Schema(example = "Ana María")
  private String nombres;

  @Schema(example = "Pérez Soto")
  private String apellidos;

  @Schema(example = "ana.perez@duocuc.cl")
  private String email;

  @Schema(example = "Ingeniería en Informática")
  private String carrera;

  @Schema(example = "21")
  private Integer edad;

  public static AlumnoResponse fromDomain(Alumno alumno) {
    AlumnoResponse response = new AlumnoResponse();
    response.setId(alumno.getId());
    response.setRut(alumno.getRut());
    response.setNombres(alumno.getNombres());
    response.setApellidos(alumno.getApellidos());
    response.setEmail(alumno.getEmail());
    response.setCarrera(alumno.getCarrera());
    response.setEdad(alumno.getEdad());
    return response;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getRut() {
    return rut;
  }

  public void setRut(String rut) {
    this.rut = rut;
  }

  public String getNombres() {
    return nombres;
  }

  public void setNombres(String nombres) {
    this.nombres = nombres;
  }

  public String getApellidos() {
    return apellidos;
  }

  public void setApellidos(String apellidos) {
    this.apellidos = apellidos;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getCarrera() {
    return carrera;
  }

  public void setCarrera(String carrera) {
    this.carrera = carrera;
  }

  public Integer getEdad() {
    return edad;
  }

  public void setEdad(Integer edad) {
    this.edad = edad;
  }
}
