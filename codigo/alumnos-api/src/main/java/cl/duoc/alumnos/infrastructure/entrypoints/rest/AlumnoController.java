package cl.duoc.alumnos.infrastructure.entrypoints.rest;

import cl.duoc.alumnos.application.usecase.AlumnoUseCase;
import cl.duoc.alumnos.infrastructure.entrypoints.rest.dto.AlumnoRequest;
import cl.duoc.alumnos.infrastructure.entrypoints.rest.dto.AlumnoResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Adaptador de entrada REST. Expone el CRUD de alumnos. */
@RestController
@RequestMapping("/api/v1/alumnos")
@Tag(name = "Alumnos", description = "Operaciones CRUD sobre alumnos")
public class AlumnoController {

  private final AlumnoUseCase alumnoUseCase;

  public AlumnoController(AlumnoUseCase alumnoUseCase) {
    this.alumnoUseCase = alumnoUseCase;
  }

  @GetMapping
  @Operation(summary = "Lista todos los alumnos")
  public List<AlumnoResponse> listar() {
    return alumnoUseCase.listar().stream().map(AlumnoResponse::fromDomain).toList();
  }

  @GetMapping("/{id}")
  @Operation(summary = "Obtiene un alumno por su id")
  @ApiResponse(responseCode = "200", description = "Alumno encontrado")
  @ApiResponse(responseCode = "404", description = "Alumno no encontrado")
  public AlumnoResponse obtener(@PathVariable Long id) {
    return AlumnoResponse.fromDomain(alumnoUseCase.obtener(id));
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(summary = "Crea un nuevo alumno")
  @ApiResponse(responseCode = "201", description = "Alumno creado")
  @ApiResponse(responseCode = "400", description = "Datos inválidos o RUT duplicado")
  public AlumnoResponse crear(@Valid @RequestBody AlumnoRequest request) {
    return AlumnoResponse.fromDomain(alumnoUseCase.crear(request.toDomain()));
  }

  @PutMapping("/{id}")
  @Operation(summary = "Actualiza un alumno existente")
  @ApiResponse(responseCode = "200", description = "Alumno actualizado")
  @ApiResponse(responseCode = "404", description = "Alumno no encontrado")
  public AlumnoResponse actualizar(
      @PathVariable Long id, @Valid @RequestBody AlumnoRequest request) {
    return AlumnoResponse.fromDomain(alumnoUseCase.actualizar(id, request.toDomain()));
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(summary = "Elimina un alumno")
  @ApiResponse(responseCode = "204", description = "Alumno eliminado")
  @ApiResponse(responseCode = "404", description = "Alumno no encontrado")
  public void eliminar(@PathVariable Long id) {
    alumnoUseCase.eliminar(id);
  }
}
