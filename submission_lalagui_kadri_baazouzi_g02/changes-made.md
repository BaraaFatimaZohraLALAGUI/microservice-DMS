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