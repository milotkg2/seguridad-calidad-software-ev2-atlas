package cl.duoc.alumnos.bdd;

import static io.cucumber.junit.platform.engine.Constants.GLUE_PROPERTY_NAME;

import org.junit.platform.suite.api.ConfigurationParameter;
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.Suite;

/**
 * Runner de Cucumber sobre JUnit Platform.
 *
 * <p>Ejecuta todos los archivos .feature de src/test/resources/features usando el glue (step
 * definitions) del paquete cl.duoc.alumnos.bdd.
 */
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(key = GLUE_PROPERTY_NAME, value = "cl.duoc.alumnos.bdd")
public class CucumberRunnerTest {}
