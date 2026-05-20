FROM node:25-alpine AS frontend-build

WORKDIR /app/frontend

COPY ../frontend/package*.json ./
RUN npm install

COPY ../frontend/ ./
RUN npm run build:docker

FROM eclipse-temurin:25-jdk-jammy AS backend-build

WORKDIR /app

COPY ../backend/gradlew .
COPY ../backend/gradle gradle
COPY ../backend/build.gradle.kts .
COPY ../backend/gradle.properties .
COPY ../backend/settings.gradle.kts .

COPY ../backend/auth auth

RUN mkdir -p auth/src/main/resources/static
COPY --from=frontend-build /app/frontend/dist/ auth/src/main/resources/static/

RUN chmod +x gradlew
RUN ./gradlew :auth:bootJar --no-daemon

FROM eclipse-temurin:25-jre-alpine-3.23

WORKDIR /app
COPY --from=backend-build /app/auth/build/libs/auth-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", \
            "-XX:+UseZGC", \
            "-XX:+ZGenerational", \
            "-XX:+UseStringDeduplication", \
            "-XX:MaxRAMPercentage=75.0", \
            "-XX:+AlwaysPreTouch", \
            "-jar", "app.jar"]
