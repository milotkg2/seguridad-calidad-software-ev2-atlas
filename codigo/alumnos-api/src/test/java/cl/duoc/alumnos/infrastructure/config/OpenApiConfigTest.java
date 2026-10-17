package cl.duoc.alumnos.infrastructure.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class OpenApiConfigTest {

  @Test
  void alumnosOpenApiTieneElTituloYVersion() {
    var openApi = new OpenApiConfig().alumnosOpenAPI();

    assertThat(openApi.getInfo().getTitle()).isEqualTo("API de Alumnos");
    assertThat(openApi.getInfo().getVersion()).isEqualTo("1.0.0");
  }
}
