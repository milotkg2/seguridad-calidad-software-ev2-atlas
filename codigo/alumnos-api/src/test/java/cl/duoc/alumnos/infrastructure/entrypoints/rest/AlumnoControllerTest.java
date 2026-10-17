package cl.duoc.alumnos.infrastructure.entrypoints.rest;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import cl.duoc.alumnos.application.usecase.AlumnoUseCase;
import cl.duoc.alumnos.domain.exception.AlumnoDuplicadoException;
import cl.duoc.alumnos.domain.exception.AlumnoNotFoundException;
import cl.duoc.alumnos.domain.model.Alumno;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class AlumnoControllerTest {

  @Mock private AlumnoUseCase alumnoUseCase;

  private final ObjectMapper objectMapper = new ObjectMapper();
  private MockMvc mockMvc;

  private Alumno alumno() {
    return new Alumno(1L, "1-9", "Ana", "Pérez", "a@duocuc.cl", "Informática", 20);
  }

  private Map<String, Object> request() {
    return Map.of(
        "rut", "1-9",
        "nombres", "Ana",
        "apellidos", "Pérez",
        "email", "a@duocuc.cl",
        "carrera", "Informática",
        "edad", 20);
  }

  @BeforeEach
  void setUp() {
    AlumnoController controller = new AlumnoController(alumnoUseCase);
    mockMvc =
        MockMvcBuilders.standaloneSetup(controller)
            .setControllerAdvice(new ApiExceptionHandler())
            .build();
  }

  @Test
  void listarDevuelve200() throws Exception {
    when(alumnoUseCase.listar()).thenReturn(List.of(alumno()));

    mockMvc
        .perform(get("/api/v1/alumnos"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(1))
        .andExpect(jsonPath("$[0].rut").value("1-9"));
  }

  @Test
  void obtenerDevuelve200() throws Exception {
    when(alumnoUseCase.obtener(1L)).thenReturn(alumno());

    mockMvc
        .perform(get("/api/v1/alumnos/1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.rut").value("1-9"));
  }

  @Test
  void obtenerDevuelve404CuandoNoExiste() throws Exception {
    when(alumnoUseCase.obtener(99L)).thenThrow(new AlumnoNotFoundException(99L));

    mockMvc.perform(get("/api/v1/alumnos/99")).andExpect(status().isNotFound());
  }

  @Test
  void crearDevuelve201() throws Exception {
    when(alumnoUseCase.crear(any(Alumno.class))).thenReturn(alumno());

    mockMvc
        .perform(
            post("/api/v1/alumnos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request())))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(1));
  }

  @Test
  void crearDevuelve400CuandoElCuerpoEsInvalido() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/alumnos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    "{\"rut\":\"\",\"nombres\":\"\",\"apellidos\":\"\","
                        + "\"email\":\"no-es-email\",\"carrera\":\"\"}"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void crearDevuelve409CuandoElRutExiste() throws Exception {
    when(alumnoUseCase.crear(any(Alumno.class))).thenThrow(new AlumnoDuplicadoException("1-9"));

    mockMvc
        .perform(
            post("/api/v1/alumnos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request())))
        .andExpect(status().isConflict());
  }

  @Test
  void actualizarDevuelve200() throws Exception {
    when(alumnoUseCase.actualizar(eq(1L), any(Alumno.class))).thenReturn(alumno());

    mockMvc
        .perform(
            put("/api/v1/alumnos/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request())))
        .andExpect(status().isOk());
  }

  @Test
  void eliminarDevuelve204() throws Exception {
    mockMvc.perform(delete("/api/v1/alumnos/1")).andExpect(status().isNoContent());
  }

  @Test
  void devuelve500CuandoOcurreUnErrorInesperado() throws Exception {
    when(alumnoUseCase.listar()).thenThrow(new RuntimeException("boom"));

    mockMvc.perform(get("/api/v1/alumnos")).andExpect(status().isInternalServerError());
  }
}
