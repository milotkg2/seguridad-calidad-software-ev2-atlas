package cl.duoc.alumnos.infrastructure.adapters.jpa;

import cl.duoc.alumnos.domain.gateway.AlumnoGateway;
import cl.duoc.alumnos.domain.model.Alumno;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

/** Adaptador que implementa el puerto AlumnoGateway usando JPA/SQLite. */
@Repository
public class AlumnoGatewayImpl implements AlumnoGateway {

  private final AlumnoJpaRepository repository;
  private final AlumnoMapper mapper;

  public AlumnoGatewayImpl(AlumnoJpaRepository repository, AlumnoMapper mapper) {
    this.repository = repository;
    this.mapper = mapper;
  }

  @Override
  public List<Alumno> findAll() {
    return repository.findAll().stream().map(mapper::toDomain).toList();
  }

  @Override
  public Optional<Alumno> findById(Long id) {
    return repository.findById(id).map(mapper::toDomain);
  }

  @Override
  public Optional<Alumno> findByRut(String rut) {
    return repository.findByRut(rut).map(mapper::toDomain);
  }

  @Override
  public Alumno save(Alumno alumno) {
    AlumnoData guardado = repository.save(mapper.toData(alumno));
    return mapper.toDomain(guardado);
  }

  @Override
  public void deleteById(Long id) {
    repository.deleteById(id);
  }
}
