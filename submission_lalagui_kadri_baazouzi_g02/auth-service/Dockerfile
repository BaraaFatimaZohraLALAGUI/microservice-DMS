FROM eclipse-temurin:21-jdk
WORKDIR /auth-service
COPY target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
