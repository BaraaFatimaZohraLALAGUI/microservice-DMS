# FROM gradle:8-jdk17 AS build
# WORKDIR /app
# COPY . .
# # This will now automatically skip tests
# RUN gradle build --no-daemon

# FROM eclipse-temurin:17-jre
# WORKDIR /app
# COPY --from=build /app/build/libs/*.jar app.jar
# EXPOSE 8080
# ENTRYPOINT ["java", "-jar", "app.jar"]


FROM eclipse-temurin:17-jre
WORKDIR /app
# Copy the pre-built JAR from your host machine
COPY springboot/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]