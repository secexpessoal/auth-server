FROM openjdk:25-ea-jdk-slim AS build
WORKDIR /app

COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts .
COPY gradle.properties .
COPY settings.gradle.kts .

COPY auth auth

RUN chmod +x gradlew
RUN ./gradlew :auth:bootJar --no-daemon

FROM openjdk:25-ea-slim
WORKDIR /app

COPY --from=build /app/auth/build/libs/auth-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

# Comando para rodar a aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]
