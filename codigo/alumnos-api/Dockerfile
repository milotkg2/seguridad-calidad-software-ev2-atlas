# syntax=docker/dockerfile:1

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
# Unifica CRLF/LF dentro de Linux para que Spotless no dependa del sistema operativo.
RUN find . -type f \( -name '*.java' -o -name '*.xml' -o -name '*.yml' -o -name '*.yaml' -o -name '*.properties' -o -name '*.md' -o -name '*.feature' \) -print0 \
    | xargs -0 sed -i 's/\r$//' \
 && mvn -B spotless:apply -DskipTests package

FROM build AS pruebas
CMD ["mvn", "-B", "verify"]

FROM eclipse-temurin:21-jre-alpine AS runtime
RUN addgroup -S app && adduser -S app -G app \
 && apk add --no-cache wget
WORKDIR /app
RUN mkdir -p /app/data && chown -R app:app /app
COPY --from=build /app/target/alumnos-api-1.0.0.jar app.jar
USER app
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=25s --retries=5 \
  CMD wget -q -O - http://127.0.0.1:8080/api/v1/alumnos || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
