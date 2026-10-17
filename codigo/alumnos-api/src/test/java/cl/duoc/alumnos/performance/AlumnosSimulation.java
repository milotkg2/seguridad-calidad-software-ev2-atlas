package cl.duoc.alumnos.performance;

import static io.gatling.javaapi.core.CoreDsl.global;
import static io.gatling.javaapi.core.CoreDsl.rampUsers;
import static io.gatling.javaapi.core.CoreDsl.scenario;
import static io.gatling.javaapi.http.HttpDsl.http;
import static io.gatling.javaapi.http.HttpDsl.status;

import io.gatling.javaapi.core.Assertion;
import io.gatling.javaapi.core.ScenarioBuilder;
import io.gatling.javaapi.core.Simulation;
import io.gatling.javaapi.http.HttpProtocolBuilder;
import java.time.Duration;

/**
 * Prueba de carga: simula usuarios concurrentes listando alumnos y valida el SLA (sin requests
 * fallidos y con una latencia media razonable).
 */
public class AlumnosSimulation extends Simulation {

  private static final int USUARIOS = Integer.getInteger("vu", 10);

  private static final HttpProtocolBuilder HTTP_PROTOCOL =
      http.baseUrl("http://localhost:8080").acceptHeader("application/json");

  private static final ScenarioBuilder ESCENARIO =
      scenario("Listar alumnos")
          .exec(http("listar").get("/api/v1/alumnos").check(status().is(200)));

  private static final Assertion SIN_FALLOS = global().failedRequests().count().lt(1L);

  private static final Assertion LATENCIA = global().responseTime().mean().lt(2000);

  {
    setUp(ESCENARIO.injectOpen(rampUsers(USUARIOS).during(Duration.ofSeconds(5))))
        .assertions(SIN_FALLOS, LATENCIA)
        .protocols(HTTP_PROTOCOL);
  }
}
