package cl.duoc.alumnos.infrastructure.entrypoints.rest.dto;

import cl.duoc.alumnos.domain.model.Alumno;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Datos para crear o actualizar un alumno")
public class AlumnoRequest {

  @NotBlank(message = "El RUT es obligatorio")
  @Size(max = 20, message = "El RUT no puede superar los 20 caracteres")
  @Schema(description = "RUT del alumno", example = "12.345.678-9")
  private String rut;

  @NotBlank(message = "Los nombres son obligatorios")
  @Size(max = 80)
  @Schema(description = "Nombres del alumno", example = "Ana María")
  private String nombres;

  @NotBlank(message = "Los apellidos son obligatorios")
  @Size(max = 80)
  @Schema(description = "Apellidos del alumno", example = "Pérez Soto")
  private String apellidos;

  @NotBlank(message = "El email es obligatorio")
  @Email(message = "El email no tiene un formato válido")
  @Schema(description = "Correo electrónico", example = "ana.perez@duocuc.cl")
  private String email;

  @NotBlank(message = "La carrera es obligatoria")
  @Size(max = 100)
  @Schema(description = "Carrera del alumno", example = "Ingeniería en Informática")
  private String carrera;

  @Min(value = 0, message = "La edad no puede ser negativa")
  @Max(value = 120, message = "La edad no es válida")
  @Schema(description = "Edad del alumno", example = "21")
  private Integer edad;

  public Alumno toDomain() {
    return new Alumno(null, rut, nombres, apellidos, email, carrera, edad);
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
