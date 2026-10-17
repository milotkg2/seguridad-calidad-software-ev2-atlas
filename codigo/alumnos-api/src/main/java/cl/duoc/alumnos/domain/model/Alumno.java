package cl.duoc.alumnos.domain.model;

import java.util.Objects;

/**
 * Modelo de dominio de un Alumno. No conoce frameworks ni detalles de persistencia (arquitectura
 * limpia).
 */
public class Alumno {

  private Long id;
  private String rut;
  private String nombres;
  private String apellidos;
  private String email;
  private String carrera;
  private Integer edad;

  public Alumno() {}

  public Alumno(
      Long id,
      String rut,
      String nombres,
      String apellidos,
      String email,
      String carrera,
      Integer edad) {
    this.id = id;
    this.rut = rut;
    this.nombres = nombres;
    this.apellidos = apellidos;
    this.email = email;
    this.carrera = carrera;
    this.edad = edad;
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

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (!(o instanceof Alumno)) {
      return false;
    }
    Alumno alumno = (Alumno) o;
    return Objects.equals(id, alumno.id) && Objects.equals(rut, alumno.rut);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, rut);
  }
}
