package cl.duoc.alumnos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** Punto de entrada del microservicio de alumnos. */
@SpringBootApplication
public class AlumnosApplication {

  public static void main(String[] args) {
    SpringApplication.run(AlumnosApplication.class, args);
  }
}
