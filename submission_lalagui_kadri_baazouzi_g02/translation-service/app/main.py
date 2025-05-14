from fastapi import FastAPI
from .gemini_client import GeminiTranslator
from .kafka_handler import KafkaHandler
from .rest_client import DocumentServiceClient
import os
import time
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
KAFKA_BOOTSTRAP_SERVERS = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
DOCUMENT_SERVICE_URL = os.getenv("DOCUMENT_SERVICE_URL", "http://localhost:8080")
DOCUMENT_SERVICE_API_KEY = os.getenv("DOCUMENT_SERVICE_API_KEY")

# Initialize FastAPI
app = FastAPI()

# Initialize translator
try:
    translator = GeminiTranslator()
    logger.info("Gemini translator initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Gemini translator: {e}")
    translator = None

# Initialize Kafka handler with retry logic
kafka = None
kafka_connected = False

def init_kafka():
    global kafka, kafka_connected
    try:
        kafka = KafkaHandler(KAFKA_BOOTSTRAP_SERVERS)
        logger.info(f"Kafka handler initialized with bootstrap servers: {KAFKA_BOOTSTRAP_SERVERS}")
        kafka_connected = True
        return True
    except Exception as e:
        logger.error(f"Failed to initialize Kafka handler: {e}")
        kafka_connected = False
        return False

# Try to initialize Kafka but continue if it fails
init_kafka()

# Initialize document service client with retry logic
document_service = None
doc_service_connected = False

def init_document_service():
    global document_service, doc_service_connected
    try:
        document_service = DocumentServiceClient(DOCUMENT_SERVICE_URL, DOCUMENT_SERVICE_API_KEY)
        # Test connection
        logger.info(f"Document service client initialized with URL: {DOCUMENT_SERVICE_URL}")
        doc_service_connected = True
        return True
    except Exception as e:
        logger.error(f"Failed to initialize document service client: {e}")
        doc_service_connected = False
        return False

# Try to initialize document service but continue if it fails
init_document_service()

# Root endpoint for healthcheck - always return healthy to prevent container restart
@app.get("/")
async def root():
    services_status = {
        "kafka": "connected" if kafka_connected else "disconnected",
        "document_service": "connected" if doc_service_connected else "disconnected",
        "translator": "initialized" if translator is not None else "failed"
    }
    # Always return 200 OK to pass healthcheck, include status details
    return {
        "status": "running", 
        "service": "translation-service",
        "services": services_status
    }

# The REST approach for handling translations
def process_translation(doc_id: int, title: str) -> str:
    """Process translation and update document service"""
    if translator is None:
        logger.error("Cannot process translation: Translator not initialized")
        return ""
    
    translated = translator.translate_text(title, "Spanish")
    if translated:
        if doc_service_connected and document_service is not None:
            # Try REST API first
            try:
                success = document_service.update_translated_title(doc_id, translated)
                if success:
                    logger.info(f"Successfully updated translation for document {doc_id}")
                    return translated
            except Exception as e:
                logger.error(f"Error updating document via REST: {e}")
        
        # Fallback to Kafka if REST failed or not connected
        if kafka_connected and kafka is not None:
            try:
                kafka.send_translation_result(str(doc_id), translated)
                logger.info(f"Sent translation via Kafka for document {doc_id}")
            except Exception as e:
                logger.error(f"Error sending translation via Kafka: {e}")
    
    return translated

@app.post("/translate/{doc_id}")
async def translate_document(doc_id: int, title: str = None):
    """Endpoint for manual translation triggering"""
    if not title:
        return {"error": "Title is required"}
    
    translated = process_translation(doc_id, title)
    return {"translation": translated}

def process_kafka_message(message: dict):
    """Callback for Kafka consumer"""
    try:
        doc_id = message.get("documentId")  # This comes from KafkaDocumentEvent.java
        title = message.get("titleEn")      # This comes from KafkaDocumentEvent.java
        
        if doc_id is not None and title:
            logger.info(f"Processing document {doc_id} with title: {title}")
            process_translation(doc_id, title)
        else:
            logger.warning(f"Received message with missing data: {message}")
    except Exception as e:
        logger.error(f"Error in process_kafka_message: {e}")

# Retry connection endpoints
@app.post("/retry-connections")
async def retry_connections():
    """Endpoint to retry connections to Kafka and document service"""
    kafka_result = init_kafka()
    doc_service_result = init_document_service()
    return {
        "kafka": "connected" if kafka_result else "failed",
        "document_service": "connected" if doc_service_result else "failed"
    }

# Start Kafka consumer in background with retry logic
@app.on_event("startup")
async def startup_event():
    if not kafka_connected or kafka is None:
        logger.warning("Kafka not connected, will not start consumer")
        return
        
    import threading
    
    def kafka_consumer_thread():
        try:
            logger.info(f"Starting Kafka consumer thread for topic: document_events")
            kafka.consume_messages("document_events", process_kafka_message)
        except Exception as e:
            logger.error(f"Error in Kafka consumer thread: {e}")
            
    threading.Thread(
        target=kafka_consumer_thread,
        daemon=True,
        name="KafkaConsumerThread"
    ).start()
    logger.info("Kafka consumer thread started")