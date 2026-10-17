package cl.duoc.alumnos.application.usecase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duoc.alumnos.domain.exception.AlumnoDuplicadoException;
import cl.duoc.alumnos.domain.exception.AlumnoNotFoundException;
import cl.duoc.alumnos.domain.gateway.AlumnoGateway;
import cl.duoc.alumnos.domain.model.Alumno;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AlumnoUseCaseTest {

  @Mock private AlumnoGateway alumnoGateway;

  @InjectMocks private AlumnoUseCase alumnoUseCase;

  private Alumno alumno() {
    return new Alumno(
        null, "12.345.678-9", "Ana", "Pérez", "ana.perez@duocuc.cl", "Informática", 21);
  }

  private Alumno alumnoConId(Long id) {
    Alumno a = alumno();
    a.setId(id);
    return a;
  }

  @Test
  void listarDevuelveTodosLosAlumnos() {
    when(alumnoGateway.findAll()).thenReturn(List.of(alumnoConId(1L), alumnoConId(2L)));

    assertThat(alumnoUseCase.listar()).hasSize(2);
    verify(alumnoGateway).findAll();
  }

  @Test
  void obtenerDevuelveElAlumnoCuandoExiste() {
    when(alumnoGateway.findById(1L)).thenReturn(Optional.of(alumnoConId(1L)));

    assertThat(alumnoUseCase.obtener(1L).getId()).isEqualTo(1L);
  }

  @Test
  void obtenerFallaCuandoNoExiste() {
    when(alumnoGateway.findById(99L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> alumnoUseCase.obtener(99L))
        .isInstanceOf(AlumnoNotFoundException.class);
  }

  @Test
  void crearGuardaCuandoElRutNoExiste() {
    Alumno nuevo = alumno();
    when(alumnoGateway.findByRut("12.345.678-9")).thenReturn(Optional.empty());
    when(alumnoGateway.save(any(Alumno.class)))
        .thenAnswer(
            inv -> {
              Alumno a = inv.getArgument(0);
              a.setId(1L);
              return a;
            });

    Alumno creado = alumnoUseCase.crear(nuevo);

    assertThat(creado.getId()).isEqualTo(1L);
    verify(alumnoGateway).save(nuevo);
  }

  @Test
  void crearFallaCuandoElRutYaExiste() {
    when(alumnoGateway.findByRut("12.345.678-9")).thenReturn(Optional.of(alumnoConId(1L)));

    assertThatThrownBy(() -> alumnoUseCase.crear(alumno()))
        .isInstanceOf(AlumnoDuplicadoException.class);

    verify(alumnoGateway, never()).save(any(Alumno.class));
  }

  @Test
  void crearDescartaElIdEntrante() {
    Alumno nuevo = alumnoConId(99L);
    when(alumnoGateway.findByRut("12.345.678-9")).thenReturn(Optional.empty());
    when(alumnoGateway.save(any(Alumno.class))).thenAnswer(inv -> inv.getArgument(0));

    assertThat(alumnoUseCase.crear(nuevo).getId()).isNull();
  }

  @Test
  void actualizarModificaYGuardaCuandoTodoEsValido() {
    Alumno actual = alumnoConId(1L);
    Alumno cambios =
        new Alumno(null, "9.876.543-2", "Luis", "Gómez", "luis@duocuc.cl", "Informática", 23);
    when(alumnoGateway.findById(1L)).thenReturn(Optional.of(actual));
    when(alumnoGateway.findByRut("9.876.543-2")).thenReturn(Optional.empty());
    when(alumnoGateway.save(any(Alumno.class))).thenAnswer(inv -> inv.getArgument(0));

    Alumno resultado = alumnoUseCase.actualizar(1L, cambios);

    assertThat(resultado.getRut()).isEqualTo("9.876.543-2");
    assertThat(resultado.getNombres()).isEqualTo("Luis");
    assertThat(resultado.getApellidos()).isEqualTo("Gómez");
    assertThat(resultado.getEmail()).isEqualTo("luis@duocuc.cl");
    assertThat(resultado.getCarrera()).isEqualTo("Informática");
    assertThat(resultado.getEdad()).isEqualTo(23);
    verify(alumnoGateway).save(actual);
  }

  @Test
  void actualizarPermiteMantenerElMismoRut() {
    Alumno actual = alumnoConId(1L);
    when(alumnoGateway.findById(1L)).thenReturn(Optional.of(actual));
    when(alumnoGateway.findByRut("12.345.678-9")).thenReturn(Optional.of(actual));
    when(alumnoGateway.save(any(Alumno.class))).thenAnswer(inv -> inv.getArgument(0));

    Alumno resultado = alumnoUseCase.actualizar(1L, alumno());

    assertThat(resultado.getId()).isEqualTo(1L);
  }

  @Test
  void actualizarFallaCuandoElNuevoRutPerteneceAOtroAlumno() {
    Alumno actual = alumnoConId(1L);
    Alumno otro =
        new Alumno(2L, "9.876.543-2", "Luis", "Gómez", "luis@duocuc.cl", "Informática", 23);
    when(alumnoGateway.findById(1L)).thenReturn(Optional.of(actual));
    when(alumnoGateway.findByRut("9.876.543-2")).thenReturn(Optional.of(otro));

    assertThatThrownBy(() -> alumnoUseCase.actualizar(1L, otro))
        .isInstanceOf(AlumnoDuplicadoException.class);

    verify(alumnoGateway, never()).save(any(Alumno.class));
  }

  @Test
  void actualizarFallaCuandoElAlumnoNoExiste() {
    when(alumnoGateway.findById(99L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> alumnoUseCase.actualizar(99L, alumno()))
        .isInstanceOf(AlumnoNotFoundException.class);
  }

  @Test
  void eliminarBorraCuandoExiste() {
    when(alumnoGateway.findById(1L)).thenReturn(Optional.of(alumnoConId(1L)));

    alumnoUseCase.eliminar(1L);

    verify(alumnoGateway).deleteById(1L);
  }

  @Test
  void eliminarFallaCuandoNoExiste() {
    when(alumnoGateway.findById(99L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> alumnoUseCase.eliminar(99L))
        .isInstanceOf(AlumnoNotFoundException.class);

    verify(alumnoGateway, never()).deleteById(any());
  }
}
