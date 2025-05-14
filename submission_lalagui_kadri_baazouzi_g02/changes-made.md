# Changes Made to the Document Management System

## Fixed Issues and Inconsistencies

1. **Gateway Service Route Configuration**
   - Updated URIs in `gateway-service/src/main/resources/application.yaml` to use container names instead of localhost
   - Changed document service port reference from incorrect 8081 to correct 8080
   - Updated routes to use container names that match docker-compose.yml:
     - `http://auth-service:8082` (was `http://localhost:8082`)
     - `http://document-service:8080` (was `http://localhost:8081`)
     - `http://storage-service:8002` (was `http://localhost:8002`)

2. **Docker Compose Updates**
   - Added environment variables for the gateway service to ensure proper service communication:
     ```yaml
     environment:
       SERVER_PORT: 8085
       SPRING_CLOUD_GATEWAY_ROUTES_0_URI: http://auth-service:8082
       SPRING_CLOUD_GATEWAY_ROUTES_1_URI: http://document-service:8080
       SPRING_CLOUD_GATEWAY_ROUTES_2_URI: http://storage-service:8002
     ```
   - Added environment variable for auth-service to explicitly set the port
   - Added a MinIO setup service to automatically create the required bucket on startup:
     ```yaml
     minio-setup:
       image: minio/mc
       container_name: minio-setup
       depends_on:
         - minio
       entrypoint: >
         /bin/sh -c "
         until (mc config host add myminio http://minio:9000 minioadmin minioadmin) do echo '...waiting for minio' && sleep 1; done;
         mc mb myminio/dms-documents;
         mc admin policy set public myminio/dms-documents;
         exit 0;
         "
     ```
   - Updated storage-service to depend on both minio and minio-setup

3. **Java Version Compatibility Fixes**
   - Fixed Java version mismatches in auth-service and gateway-service:
     - Updated auth-service Dockerfile to use Java 21 instead of Java 17 to match pom.xml configuration
     - Updated gateway-service Dockerfile to use Java 21 instead of Java 17 to match pom.xml configuration
   - Fixed port mismatch in document-service:
     - Updated document-service Dockerfile to expose port 8080 instead of 8081 to match docker-compose configuration

4. **Port Conflict Resolution**
   - Changed document-service external port mapping in docker-compose.yml from 8080 to 8081
   - The service still runs on port 8080 internally, but is accessible externally on port 8081
   - This resolves conflicts with other services that might be using port 8080 on the host machine

5. **Translation Service Stability Improvements**
   - Added a healthcheck to the translation-service in docker-compose.yml
   - Added restart policy to automatically restart the service if it fails
   - Added a root endpoint (/) to the FastAPI app for healthcheck
   - Installed curl in the Dockerfile for healthcheck commands
   - Enhanced error handling in the Kafka consumer to prevent fatal crashes
   - Extended the start period in the healthcheck to give more time for initialization

6. **Additional Translation Service Resilience**
   - Completely redesigned error handling to make the service more resilient
   - Added proper logging instead of print statements
   - Made connections to Kafka and document-service optional
   - Added retry mechanisms for document service communication
   - Added connection testing with timeouts to prevent hanging during startup
   - Changed restart policy from `on-failure` to `always` to ensure continuous operation
   - Simplified service dependencies to prevent dependency cycles
   - Added a new `/retry-connections` endpoint to manually trigger reconnections

7. **Kafka Topic Creation**
   - Added a kafka-setup service to create the required Kafka topics on startup
   - Created the `document_events` topic that was causing connection errors
   - Created the `document-translation-results` topic for translation results
   - Made both document-service and translation-service depend on kafka-setup
   - This prevents errors when services try to use Kafka topics that don't exist yet

8. **PostgreSQL Database Setup**
   - Added initialization script to create the `document_service` database
   - Created a new folder `postgres-init` with SQL scripts for database initialization
   - Added volume mount in docker-compose.yml to run initialization scripts
   - Updated document-service configuration to use the local PostgreSQL instead of Supabase
   - Fixed port inconsistency in document-service application.yaml
   - Added JPA configuration environment variables to docker-compose.yml for document-service

## Documentation Created

1. **Comprehensive API Documentation** (`documentation.md`)
   - System overview and architecture
   - Detailed API reference for all services
   - Authentication flow and usage
   - Request and response examples
   - Role-based access control explanation

2. **Quick Start Guide** (`README.md`)
   - Simple instructions for running the system
   - Summary of services and technologies
   - Default credentials
   - Basic usage flow

## Running the System

The system is now configured to run with a single command:

```bash
docker-compose up -d
```

After starting, you can access the gateway at http://localhost:8085 and use the API as documented.

## Default Admin Credentials

- Username: `admin`
- Password: `admin`

## MinIO Console Access

You can access the MinIO web console at http://localhost:9001 with:
- Username: `minioadmin`
- Password: `minioadmin` 