# Document Management System (DMS) - Microservices Architecture

This project is a document management system built with a microservices architecture. It allows for document uploading, categorization, departmental access controls, and automatic translation of document titles.

## Quick Start Guide

### Prerequisites
- Docker and Docker Compose installed

### Running the System
1. Clone this repository
2. Navigate to the project directory
3. Run the system with Docker Compose:

```bash
docker-compose up -d
```

4. Wait for all services to start (this may take a minute or two)
5. Access the gateway at: http://localhost:8085

## Included Services

1. **Authentication Service**: User management and JWT authentication
2. **Document Service**: Document metadata management
3. **Storage Service**: File storage using MinIO
4. **Translation Service**: Automatic title translation using Google Gemini
5. **Gateway Service**: API gateway for unified access

## Default Admin Access

- Username: `admin`
- Password: `admin`

## Basic Usage Flow

1. Register a user or use the admin account
2. Get an authentication token via `/auth/token`
3. Create departments and categories (admin only)
4. Assign users to departments (admin only)
5. Upload files and create documents
6. View and manage your documents

## Complete Documentation

See the [Documentation](documentation.md) file for a complete API reference and detailed usage instructions.

## Technologies Used

- Spring Boot (Java): Authentication, Gateway, Document services
- FastAPI (Python): Storage, Translation services
- PostgreSQL: Data storage
- MinIO: S3-compatible object storage
- Kafka: Event-driven communication
- Docker: Containerization 