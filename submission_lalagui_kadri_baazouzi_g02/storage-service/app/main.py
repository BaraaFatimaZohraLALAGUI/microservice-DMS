# storage-service/main.py (Corrected and Configured for MinIO)

import logging
import os
import time
import uuid
from mimetypes import guess_type # For better content-type detection

import boto3 # Use boto3 for S3 compatible API
from botocore.client import Config # For signature version if needed
from botocore.exceptions import ClientError, NoCredentialsError
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse # Import if using custom JSON responses

# --- Configuration Loading ---
load_dotenv() # Load variables from .env file for local development

# MinIO Configuration from .env
MINIO_ENDPOINT_URL = os.getenv("MINIO_ENDPOINT_URL")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY")
MINIO_BUCKET_NAME = os.getenv("MINIO_BUCKET_NAME")
# Default to False if MINIO_USE_SSL is not set or invalid
MINIO_USE_SSL = os.getenv("MINIO_USE_SSL", 'false').lower() == 'true'

# --- Basic Logging Setup ---
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# --- FastAPI App Initialization ---
# CORRECTED: Added description and version as keyword arguments
app = FastAPI(
    title="Storage Service (MinIO)",
    description="Handles file uploads to MinIO S3-compatible storage and generates pre-signed download URLs.",
    version="1.0.0"
)

# --- S3 Client Initialization (for MinIO) with retry ---
MAX_RETRIES = 5
RETRY_DELAY = 5  # seconds
s3_client = None

def init_s3_client():
    global s3_client
    if MINIO_ENDPOINT_URL and MINIO_ACCESS_KEY and MINIO_SECRET_KEY and MINIO_BUCKET_NAME:
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                logger.info(f"Initializing S3 client for MinIO endpoint: {MINIO_ENDPOINT_URL}, SSL: {MINIO_USE_SSL} (Attempt {attempt}/{MAX_RETRIES})")
                s3_client = boto3.client(
                    's3',
                    endpoint_url=MINIO_ENDPOINT_URL,
                    aws_access_key_id=MINIO_ACCESS_KEY,
                    aws_secret_access_key=MINIO_SECRET_KEY,
                    config=Config(signature_version='s3v4'), # Often required for MinIO compatibility
                    use_ssl=MINIO_USE_SSL,
                    # region_name='us-east-1' # Typically not needed for MinIO unless configured
                )
                
                # Verify connection by listing buckets
                response = s3_client.list_buckets()
                bucket_names = [b['Name'] for b in response['Buckets']]
                logger.info(f"Successfully connected to MinIO. Available buckets: {bucket_names}")
                
                # Verify bucket exists
                if MINIO_BUCKET_NAME in bucket_names:
                    logger.info(f"Target bucket '{MINIO_BUCKET_NAME}' exists and is accessible.")
                    return True
                else:
                    logger.warning(f"Target bucket '{MINIO_BUCKET_NAME}' not found. Available buckets: {bucket_names}")
                    # Try creating the bucket if it doesn't exist
                    try:
                        s3_client.create_bucket(Bucket=MINIO_BUCKET_NAME)
                        logger.info(f"Created bucket '{MINIO_BUCKET_NAME}'")
                        return True
                    except Exception as e:
                        logger.error(f"Failed to create bucket '{MINIO_BUCKET_NAME}': {e}")
            
            except Exception as e:
                logger.error(f"Failed to initialize Boto3 S3 client for MinIO (Attempt {attempt}/{MAX_RETRIES}): {e}")
                if attempt < MAX_RETRIES:
                    logger.info(f"Retrying in {RETRY_DELAY} seconds...")
                    time.sleep(RETRY_DELAY)
                else:
                    logger.error("Max retries reached. Could not initialize S3 client.")
                    return False
    else:
        logger.warning("MinIO environment variables (ENDPOINT_URL, ACCESS_KEY, SECRET_KEY, BUCKET_NAME) not fully configured.")
        return False

# Initialize S3 client with retry logic
init_s3_client()

# --- Helper Function ---
def check_s3_client_configured():
    """Checks if S3 client is ready."""
    if not s3_client:
        logger.error("S3 client (MinIO) is not initialized. Check configuration and logs.")
        raise HTTPException(status_code=503, detail="S3 storage client not available.") # 503 Service Unavailable
    if not MINIO_BUCKET_NAME:
         logger.error("MINIO_BUCKET_NAME environment variable not set.")
         raise HTTPException(status_code=500, detail="MinIO bucket name not configured on server.")

# --- API Endpoints ---

@app.post("/upload/", 
          summary="Upload a file to MinIO", 
          description="Accepts a file upload and stores it in the configured MinIO bucket.")
async def upload_file(file: UploadFile = File(..., description="The file to upload.")):
    """
    Handles file upload, saves to MinIO, and returns metadata including the S3 key.
    """
    check_s3_client_configured()

    # Generate a unique key (path) for the S3 object within the bucket
    file_extension = os.path.splitext(file.filename)[1].lower() if '.' in file.filename else ''
    unique_id = uuid.uuid4()
    # Example: documents/c1f4e9e0-5e6a-4b8f-8e4e-1f2d9c8b7a0a.pdf
    s3_file_key = f"documents/{unique_id}{file_extension}" 

    # Determine content type
    content_type = file.content_type
    if not content_type or content_type == 'application/octet-stream':
        guessed_type, _ = guess_type(file.filename)
        content_type = guessed_type or 'application/octet-stream' # Use guessed type or fallback

    logger.info(f"Attempting upload: Filename='{file.filename}', ContentType='{content_type}', S3 Key='{s3_file_key}', Bucket='{MINIO_BUCKET_NAME}'")

    try:
        # Use upload_fileobj for efficient streaming upload
        s3_client.upload_fileobj(
            file.file,                  # The file-like object stream
            MINIO_BUCKET_NAME,          # Target bucket
            s3_file_key,                # Target key (path) in the bucket
            ExtraArgs={                 # Pass metadata like ContentType
                "ContentType": content_type 
            } 
        )
        logger.info(f"Successfully uploaded '{file.filename}' to MinIO key '{s3_file_key}'")

        # Get size AFTER upload (more reliable if file stream is processed)
        # Note: file.size provided by FastAPI might be sufficient, but can be tricky with streaming
        # For simplicity, we rely on the size provided by FastAPI's UploadFile
        file_size = file.size 

        # Return information needed by the Document Service (using s3_key field name)
        return {
            "message": "File uploaded successfully to MinIO",
            "s3_key": s3_file_key, # Use this key name, expected by Document Service DTO
            "filename": file.filename,
            "content_type": content_type,
            "size": file_size
        }

    except NoCredentialsError:
        logger.error("MinIO credentials not found by boto3.")
        raise HTTPException(status_code=500, detail="Server configuration error: MinIO credentials not found.")
    except ClientError as e:
        error_code = e.response.get("Error", {}).get("Code")
        logger.error(f"MinIO ClientError during upload: {e} (Code: {error_code})", exc_info=True)
        # Provide more specific errors if possible
        if error_code == 'NoSuchBucket':
             raise HTTPException(status_code=500, detail=f"Configuration error: Bucket '{MINIO_BUCKET_NAME}' not found.")
        elif error_code == 'AccessDenied':
             raise HTTPException(status_code=500, detail="Configuration error: Access denied to MinIO bucket.")
        else:
             raise HTTPException(status_code=500, detail=f"Could not upload file to MinIO: {error_code or 'Unknown S3 error'}")
    except Exception as e:
        logger.error(f"An unexpected error occurred during MinIO upload: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal server error occurred during file upload.")
    finally:
        # Ensure the file stream provided by FastAPI is closed
         await file.close()


@app.get("/presigned-url/{s3_file_key:path}", 
         summary="Generate MinIO Pre-signed URL",
         description="Generates a temporary pre-signed URL for downloading a file directly from MinIO.")
async def get_presigned_download_url(s3_file_key: str):
    """
    Generates a pre-signed URL for downloading an object from MinIO.
    The `s3_file_key` should be the full path within the bucket (e.g., 'documents/some-uuid.pdf').
    """
    check_s3_client_configured()

    # URL expires in 1 hour (3600 seconds) - adjust as needed
    expiration = 3600 

    logger.info(f"Generating MinIO pre-signed URL for key: {s3_file_key}")

    try:
        # Use standard boto3 method
        response = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': MINIO_BUCKET_NAME, 'Key': s3_file_key},
            ExpiresIn=expiration
        )
        logger.info(f"Successfully generated MinIO pre-signed URL for key: {s3_file_key}")
        return {"url": response}

    except NoCredentialsError:
        logger.error("MinIO credentials not found.")
        raise HTTPException(status_code=500, detail="Server configuration error: MinIO credentials not found.")
    except ClientError as e:
        # Check if the error is because the object doesn't exist
        if e.response['Error']['Code'] == 'NoSuchKey':
            logger.warning(f"Attempted to generate URL for non-existent MinIO key: {s3_file_key}")
            raise HTTPException(status_code=404, detail=f"File not found with key: {s3_file_key}")
        else:
            error_code = e.response.get("Error", {}).get("Code")
            logger.error(f"MinIO ClientError during pre-signed URL generation: {e} (Code: {error_code})", exc_info=True)
            raise HTTPException(status_code=500, detail="Could not generate download URL.")
    except Exception as e:
        logger.error(f"An unexpected error occurred generating MinIO pre-signed URL: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal server error occurred.")


# --- Root Endpoint (Optional - for health check/info) ---
@app.get("/", summary="Root Endpoint", description="Basic endpoint to check if the service is running.")
async def read_root():
    bucket_accessible = False
    if s3_client:
        try:
            s3_client.head_bucket(Bucket=MINIO_BUCKET_NAME)
            bucket_accessible = True
        except:
            pass
            
    return {
        "message": "Storage Service (MinIO) is running.",
        "minio_configured": s3_client is not None,
        "bucket_accessible": bucket_accessible,
        "bucket_name": MINIO_BUCKET_NAME
    }


# --- Run the Server (for local execution) ---
if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Storage Service (MinIO) locally with Uvicorn...")
    # Use port 8002 or another suitable port
    # Pass app.main:app as string to enable reload correctly
    uvicorn.run("app.main:app", host="0.0.0.0", port=8002, reload=True) 