FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /workspace

COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -DskipTests dependency:go-offline

COPY src src
RUN ./mvnw -B -DskipTests package

FROM eclipse-temurin:21-jre-jammy
RUN useradd --system --create-home --uid 10001 syncdrive
WORKDIR /app
COPY --from=build /workspace/target/*.jar app.jar
USER syncdrive
EXPOSE 8085
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
