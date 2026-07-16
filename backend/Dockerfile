# Stage 1: Build Maven jar
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run application jar
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/carbon-tracker-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
