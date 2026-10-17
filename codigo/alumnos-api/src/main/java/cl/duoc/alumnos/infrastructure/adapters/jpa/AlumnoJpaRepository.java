package cl.duoc.alumnos.infrastructure.adapters.jpa;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/** Repositorio Spring Data JPA sobre SQLite. */
public interface AlumnoJpaRepository extends JpaRepository<AlumnoData, Long> {

  Optional<AlumnoData> findByRut(String rut);
}
