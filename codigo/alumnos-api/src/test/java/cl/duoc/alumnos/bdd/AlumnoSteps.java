package cl.duoc.alumnos.bdd;

import static org.assertj.core.api.Assertions.assertThat;

import cl.duoc.alumnos.application.usecase.AlumnoUseCase;
import cl.duoc.alumnos.domain.exception.AlumnoDuplicadoException;
import cl.duoc.alumnos.domain.model.Alumno;
import io.cucumber.java.es.Cuando;
import io.cucumber.java.es.Dado;
import io.cucumber.java.es.Entonces;

/**
 * Step definitions (glue) de los escenarios de alumnos. Cucumber crea una instancia nueva por
 * escenario, por lo que cada uno parte con un repositorio en memoria vacio.
 */
public class AlumnoSteps {

  private final InMemoryAlumnoGateway gateway = new InMemoryAlumnoGateway();
  private final AlumnoUseCase useCase = new AlumnoUseCase(gateway);

  private Alumno registrado;
  private Exception error;

  @Dado("que no existe un alumno con RUT {string}")
  public void queNoExiste(String rut) {
    assertThat(gateway.findByRut(rut)).isEmpty();
  }

  @Dado("que ya existe un alumno con RUT {string}")
  public void queYaExiste(String rut) {
    useCase.crear(alumno(rut, "Existente"));
  }

  @Cuando("registro un alumno con RUT {string} y nombre {string}")
  public void registro(String rut, String nombre) {
    registrado = useCase.crear(alumno(rut, nombre));
    error = null;
  }

  @Cuando("intento registrar otro alumno con RUT {string}")
  public void intentoRegistrar(String rut) {
    try {
      registrado = useCase.crear(alumno(rut, "Duplicado"));
      error = null;
    } catch (Exception e) {
      error = e;
    }
  }

  @Entonces("el alumno {string} queda registrado")
  public void quedaRegistrado(String rut) {
    assertThat(registrado).isNotNull();
    assertThat(registrado.getId()).isNotNull();
    assertThat(registrado.getRut()).isEqualTo(rut);
  }

  @Entonces("la lista de alumnos tiene {int} elemento(s)")
  public void listaTiene(int cantidad) {
    assertThat(useCase.listar()).hasSize(cantidad);
  }

  @Entonces("el registro falla por RUT duplicado")
  public void fallaPorDuplicado() {
    assertThat(error).isInstanceOf(AlumnoDuplicadoException.class);
  }

  private Alumno alumno(String rut, String nombre) {
    return new Alumno(null, rut, nombre, "Pérez", "alumno@duocuc.cl", "Informática", 20);
  }
}
