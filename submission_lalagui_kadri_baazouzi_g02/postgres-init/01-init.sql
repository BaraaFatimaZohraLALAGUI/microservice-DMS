-- Create document_service database
CREATE DATABASE document_service;

-- Connect to document_service database
\c document_service;

-- Create extension for UUID generation (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schema for document service tables (if needed)
-- CREATE SCHEMA IF NOT EXISTS document_schema;

-- Set path to include the schema (if needed)
-- SET search_path TO document_schema, public;

-- Permissions (optional)
GRANT ALL PRIVILEGES ON DATABASE document_service TO postgres;

-- Create tables or other database objects if needed
-- They will be created by Hibernate with update mode 