package cl.duoc.alumnos.infrastructure.entrypoints.rest;

import cl.duoc.alumnos.domain.exception.AlumnoDuplicadoException;
import cl.duoc.alumnos.domain.exception.AlumnoNotFoundException;
import cl.duoc.alumnos.infrastructure.entrypoints.rest.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Traduce las excepciones a respuestas HTTP claras. */
@RestControllerAdvice
public class ApiExceptionHandler {

  @ExceptionHandler(AlumnoNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleNotFound(
      AlumnoNotFoundException ex, HttpServletRequest request) {
    ErrorResponse body =
        new ErrorResponse(
            HttpStatus.NOT_FOUND.value(), "Not Found", ex.getMessage(), request.getRequestURI());
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
  }

  @ExceptionHandler(AlumnoDuplicadoException.class)
  public ResponseEntity<ErrorResponse> handleDuplicado(
      AlumnoDuplicadoException ex, HttpServletRequest request) {
    ErrorResponse body =
        new ErrorResponse(
            HttpStatus.CONFLICT.value(), "Conflict", ex.getMessage(), request.getRequestURI());
    return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidation(
      MethodArgumentNotValidException ex, HttpServletRequest request) {
    Map<String, String> details = new LinkedHashMap<>();
    for (FieldError error : ex.getBindingResult().getFieldErrors()) {
      details.put(error.getField(), error.getDefaultMessage());
    }
    ErrorResponse body =
        new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Bad Request",
            "La solicitud contiene datos inválidos",
            request.getRequestURI());
    body.setDetails(details);
    return ResponseEntity.badRequest().body(body);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) {
    ErrorResponse body =
        new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Internal Server Error",
            ex.getMessage(),
            request.getRequestURI());
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
  }
}
