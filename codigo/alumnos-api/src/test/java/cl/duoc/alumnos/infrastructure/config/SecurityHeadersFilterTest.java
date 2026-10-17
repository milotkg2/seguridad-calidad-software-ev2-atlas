package cl.duoc.alumnos.infrastructure.config;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class SecurityHeadersFilterTest {

  private final SecurityHeadersFilter filtro = new SecurityHeadersFilter();

  @Test
  void agregaLasCabecerasDeSeguridadEnCadaRespuesta() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/");
    MockHttpServletResponse response = new MockHttpServletResponse();
    FilterChain cadena = (req, res) -> {};

    filtro.doFilterInternal(request, response, cadena);

    assertThat(response.getHeader("X-Content-Type-Options")).isEqualTo("nosniff");
    assertThat(response.getHeader("X-Frame-Options")).isEqualTo("DENY");
    assertThat(response.getHeader("Content-Security-Policy")).isEqualTo("default-src 'self'");
    assertThat(response.getHeader("Referrer-Policy")).isEqualTo("no-referrer");
    assertThat(response.getHeader("Permissions-Policy")).isEqualTo("geolocation=()");
  }
}
