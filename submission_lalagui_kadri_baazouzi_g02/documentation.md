# Document Management System (DMS) - Microservices Documentation

This document provides a comprehensive guide to the Document Management System (DMS) microservices architecture, including how to run the system and use its various endpoints.

## Table of Contents
1. [System Overview](#system-overview)
2. [Running the System](#running-the-system)
3. [Authentication Service](#authentication-service)
4. [Document Service](#document-service)
5. [Storage Service](#storage-service)
6. [Translation Service](#translation-service)
7. [Gateway Service](#gateway-service)
8. [Complete API Reference](#complete-api-reference)

## System Overview

The Document Management System (DMS) consists of 5 microservices:

1. **Authentication Service**: Handles user registration, login, and token generation
2. **Document Service**: Manages document metadata, categories, and departments
3. **Storage Service**: Provides file storage capabilities via MinIO
4. **Translation Service**: Automatically translates document titles using Google's Gemini AI
5. **Gateway Service**: Routes requests to appropriate services and handles authentication

The system uses:
- PostgreSQL for data storage
- Kafka for event-driven communication between services
- MinIO for S3-compatible object storage

## Running the System

### Prerequisites
- Docker and Docker Compose installed

### Steps to Run

1. Clone the repository
2. Navigate to the project directory
3. Run the following command:

```bash
docker-compose up -d
```

4. Wait for all services to start up (this may take a minute or two)
5. Access the Gateway API at: http://localhost:8085

> **Note**: While the document-service runs on port 8080 internally, it's mapped to port 8081 externally to avoid port conflicts. You can access it directly at http://localhost:8081 if needed, but it's recommended to go through the gateway at http://localhost:8085.

## Authentication Service

The Authentication Service manages user authentication, registration, and authorization. It uses JWT tokens for secure access.

### Default Admin User
The system creates a default admin user on startup:
- Username: `admin`
- Password: `adminpassword`

### Enhanced User Management
The Authentication Service now provides enhanced user management capabilities with extended profile information, including:
- Personal information (name, email, phone)
- Professional details (position, department, hire date)
- User status management
- Department assignment

### Key Endpoints

All authentication endpoints are accessible through the Gateway at `/auth/**`

#### Register a New User
```
POST /auth/signup
```
**Request Body:**
```json
{
  "username": "user1",
  "password": "password123"
}
```
**Response:**
```json
{
  "username": "user1",
  "roles": ["ROLE_USER"]
}
```

#### Get Authentication Token
```
POST /auth/token
```
**Use HTTP Basic Authentication with your username and password**

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyMSIsInJvbGVzIjpbIlJPT...etc"
}
```

### Admin User Management
```
GET /admin/users               # List all users with profile data (admin only)
GET /admin/users/{username}    # Get a user with profile data (admin only)
POST /admin/users              # Create a user with profile (admin only)
PUT /admin/users/{username}    # Update a user with profile (admin only)
DELETE /admin/users/{username} # Delete a user (admin only)
```

**Enhanced User Creation Example:**
```json
{
  "username": "employee1",
  "password": "securepass123",
  "roles": ["ROLE_USER"],
  "name": "John Smith",
  "email": "john.smith@example.com",
  "phone": "123-456-7890",
  "position": "Software Engineer",
  "department": "Engineering",
  "status": "Active",
  "address": "123 Main St, City",
  "hireDate": "2023-01-15T00:00:00Z",
  "employeeId": 1001
}
```

**User Update Example:**
```json
{
  "password": "newpassword",
  "roles": ["ROLE_USER", "ROLE_MANAGER"],
  "position": "Senior Software Engineer",
  "department": "Engineering",
  "status": "Active"
}
```

## Document Service

The Document Service manages document metadata, categories, and departments.

### Categories API

Categories are used to classify documents.

```
GET /api/v1/categories        # List all categories (user, admin)
GET /api/v1/categories/{id}   # Get a specific category (user, admin)
POST /api/v1/categories       # Create a category (admin only)
PUT /api/v1/categories/{id}   # Update a category (admin only)
DELETE /api/v1/categories/{id} # Delete a category (admin only)
```

**Category Object Example:**
```json
{
  "id": 1,
  "name": "Financial Reports"
}
```

### Departments API

Departments are organizational units that can have users assigned to them.

```
GET /api/v1/departments        # List all departments (user, admin)
GET /api/v1/departments/{id}   # Get a specific department (user, admin)
POST /api/v1/departments       # Create a department (admin only)
PUT /api/v1/departments/{id}   # Update a department (admin only)
DELETE /api/v1/departments/{id} # Delete a department (admin only)
```

**Department Object Example:**
```json
{
  "id": 1,
  "name": "Finance"
}
```

#### User Department Assignment

```
POST /api/v1/departments/{deptId}/users      # Assign user to department (admin only)
DELETE /api/v1/departments/{deptId}/users/{userId}  # Unassign user (admin only)
```

**User Assignment Example:**
```json
{
  "userId": "user1"
}
```

### Documents API

Documents are the core entities of the system.

```
GET /api/v1/documents         # List documents for current user (user)
GET /api/v1/documents/all     # List all documents (admin only)
GET /api/v1/documents/{id}    # Get a specific document (user, admin)
POST /api/v1/documents        # Create a document (user)
DELETE /api/v1/documents/{id} # Delete a document (admin only)
```

**Document Create Example:**
```json
{
  "title": "Q1 Financial Report",
  "description": "Financial results for Q1 2023",
  "categoryId": 1,
  "departmentId": 1,
  "s3FileKey": "documents/abc123.pdf"
}
```

**Document View Example:**
```json
{
  "id": 1,
  "title": "Q1 Financial Report",
  "titleEs": "Informe Financiero del primer trimestre",
  "description": "Financial results for Q1 2023",
  "categoryName": "Financial Reports",
  "departmentName": "Finance",
  "createdAt": "2023-05-15T14:30:00Z",
  "createdBy": "user1",
  "s3FileKey": "documents/abc123.pdf"
}
```

## Storage Service

The Storage Service handles file uploads and retrieving files from MinIO.

### Endpoints

```
POST /upload/                     # Upload a file
GET /presigned-url/{s3_file_key}  # Get a download URL for a file
```

#### Upload a File

```
POST /api/v1/storage/upload/
```

**Form Data:**
- `file`: The file to upload (multipart/form-data)

**Response:**
```json
{
  "message": "File uploaded successfully to MinIO",
  "s3_key": "documents/abc123.pdf",
  "filename": "report.pdf",
  "content_type": "application/pdf",
  "size": 1024000
}
```

#### Get Download URL

```
GET /api/v1/storage/presigned-url/documents/abc123.pdf
```

**Response:**
```json
{
  "url": "http://localhost:9000/dms-documents/documents/abc123.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=..."
}
```

## Translation Service

The Translation Service automatically translates document titles from English to Spanish using Google's Gemini AI.

### Endpoints

```
POST /translate/{doc_id}  # Manual translation trigger
```

**Request Parameters:**
- `doc_id`: Document ID
- `title`: The title to translate

**Response:**
```json
{
  "translation": "Informe Financiero del primer trimestre"
}
```

Note: The Translation Service also listens to Kafka events when new documents are created and automatically translates their titles.

## Gateway Service

The Gateway Service (running on port 8085) routes all API requests to the appropriate services and handles authentication via JWT.

### Authentication Flow

1. Register a user (`POST /auth/signup`)
2. Get a token (`POST /auth/token`) with Basic Auth
3. Use the token in subsequent requests:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2Vy...
   ```

## Complete API Reference

Below is a comprehensive list of all available API endpoints, accessible through the Gateway Service (http://localhost:8085):

### Authentication Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | /auth/signup | Register a new user | Public |
| POST | /auth/token | Get an auth token | Public |
| GET | /admin/users | List all users with profile data | Admin |
| GET | /admin/users/{username} | Get a user with profile data | Admin |
| POST | /admin/users | Create a user with profile | Admin |
| PUT | /admin/users/{username} | Update a user with profile | Admin |
| DELETE | /admin/users/{username} | Delete a user | Admin |

### Document Management Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | /api/v1/categories | List all categories | User, Admin |
| GET | /api/v1/categories/{id} | Get category by ID | User, Admin |
| POST | /api/v1/categories | Create a category | Admin |
| PUT | /api/v1/categories/{id} | Update a category | Admin |
| DELETE | /api/v1/categories/{id} | Delete a category | Admin |
| GET | /api/v1/departments | List all departments | User, Admin |
| GET | /api/v1/departments/{id} | Get department by ID | User, Admin |
| POST | /api/v1/departments | Create a department | Admin |
| PUT | /api/v1/departments/{id} | Update a department | Admin |
| DELETE | /api/v1/departments/{id} | Delete a department | Admin |
| POST | /api/v1/departments/{deptId}/users | Assign user to department | Admin |
| DELETE | /api/v1/departments/{deptId}/users/{userId} | Unassign user from department | Admin |
| GET | /api/v1/documents | List documents for current user | User |
| GET | /api/v1/documents/all | List all documents | Admin |
| GET | /api/v1/documents/{id} | Get document by ID | User, Admin |
| POST | /api/v1/documents | Create a document | User |
| DELETE | /api/v1/documents/{id} | Delete a document | Admin |

### Storage Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | /api/v1/storage/upload/ | Upload a file | User, Admin |
| GET | /api/v1/storage/presigned-url/{s3_file_key} | Get download URL | User, Admin |

### Translation Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | /translate/{doc_id} | Manually trigger translation | Service |

## Typical Usage Flow

1. Register as a user or log in as admin
2. Get an authentication token
3. As admin:
   - Create categories and departments
   - Assign users to departments
4. As user:
   - Upload a file via storage API
   - Create a document using the s3_key from the upload
   - View and manage your documents
5. Translations happen automatically in the background

## Accessing MinIO Console

You can access the MinIO web console at http://localhost:9001 with:
- Username: `minioadmin`
- Password: `minioadmin` 