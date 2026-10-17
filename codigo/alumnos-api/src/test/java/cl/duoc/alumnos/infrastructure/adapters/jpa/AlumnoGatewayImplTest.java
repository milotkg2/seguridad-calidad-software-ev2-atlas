package cl.duoc.alumnos.infrastructure.adapters.jpa;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duoc.alumnos.domain.model.Alumno;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AlumnoGatewayImplTest {

  @Mock private AlumnoJpaRepository repository;
  @Mock private AlumnoMapper mapper;
  @InjectMocks private AlumnoGatewayImpl gateway;

  private AlumnoData data() {
    AlumnoData d = new AlumnoData();
    d.setId(1L);
    d.setRut("1-9");
    return d;
  }

  private Alumno alumno() {
    return new Alumno(1L, "1-9", "Ana", "Pérez", "a@duocuc.cl", "Informática", 20);
  }

  @Test
  void findAllMapeaCadaEntidad() {
    when(repository.findAll()).thenReturn(List.of(data()));
    when(mapper.toDomain(any(AlumnoData.class))).thenReturn(alumno());

    assertThat(gateway.findAll()).hasSize(1);
  }

  @Test
  void findByIdMapeaCuandoExiste() {
    when(repository.findById(1L)).thenReturn(Optional.of(data()));
    when(mapper.toDomain(any(AlumnoData.class))).thenReturn(alumno());

    assertThat(gateway.findById(1L)).contains(alumno());
  }

  @Test
  void findByIdDevuelveVacioCuandoNoExiste() {
    when(repository.findById(9L)).thenReturn(Optional.empty());

    assertThat(gateway.findById(9L)).isEmpty();
  }

  @Test
  void findByRutMapeaCuandoExiste() {
    when(repository.findByRut("1-9")).thenReturn(Optional.of(data()));
    when(mapper.toDomain(any(AlumnoData.class))).thenReturn(alumno());

    assertThat(gateway.findByRut("1-9")).contains(alumno());
  }

  @Test
  void findByRutDevuelveVacioCuandoNoExiste() {
    when(repository.findByRut("x")).thenReturn(Optional.empty());

    assertThat(gateway.findByRut("x")).isEmpty();
  }

  @Test
  void saveMapeaIdaYVuelta() {
    when(mapper.toData(any(Alumno.class))).thenReturn(data());
    when(repository.save(any(AlumnoData.class))).thenReturn(data());
    when(mapper.toDomain(any(AlumnoData.class))).thenReturn(alumno());

    assertThat(gateway.save(alumno())).isEqualTo(alumno());
  }

  @Test
  void deleteByIdDelegaEnElRepositorio() {
    gateway.deleteById(1L);

    verify(repository).deleteById(1L);
  }
}
