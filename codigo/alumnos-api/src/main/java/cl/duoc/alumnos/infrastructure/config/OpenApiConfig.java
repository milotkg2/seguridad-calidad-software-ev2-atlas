package cl.duoc.alumnos.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Metadatos OpenAPI del microservicio. El contrato visible para Swagger UI / Redoc es el YAML en
 * /openapi/alumnos-openapi.yaml.
 */
@Configuration
public class OpenApiConfig {

  @Bean
  public OpenAPI alumnosOpenAPI() {
    return new OpenAPI()
        .info(
            new Info()
                .title("API de Alumnos")
                .description(
                    "Microservicio base para la gestión de alumnos (CRUD) con arquitectura limpia")
                .version("1.0.0")
                .contact(
                    new Contact().name("Ingeniería DevOps - Duoc UC").email("devops@duocuc.cl"))
                .license(new License().name("Uso académico")));
  }
}
