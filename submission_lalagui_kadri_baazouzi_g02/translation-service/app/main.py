from fastapi import FastAPI
from .gemini_client import GeminiTranslator
from .kafka_handler import KafkaHandler
from .rest_client import DocumentServiceClient
import os
from dotenv import load_dotenv

load_dotenv()
KAFKA_BOOTSTRAP_SERVERS = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
app = FastAPI()
translator = GeminiTranslator()
kafka = KafkaHandler(KAFKA_BOOTSTRAP_SERVERS)
document_service = DocumentServiceClient(
    os.getenv("DOCUMENT_SERVICE_URL", "http://localhost:8080"),
    os.getenv("DOCUMENT_SERVICE_API_KEY")
)

# The REST approach for handling translations
def process_translation(doc_id: int, title: str) -> str:
    """Process translation and update document service"""
    translated = translator.translate_text(title, "Spanish")
    if translated:
        # Try REST API first
        success = document_service.update_translated_title(doc_id, translated)
        if not success:
            # Fallback to Kafka
            kafka.send_translation_result(str(doc_id), translated)
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
    doc_id = message.get("documentId")  # This comes from KafkaDocumentEvent.java
    title = message.get("titleEn")      # This comes from KafkaDocumentEvent.java
    
    if doc_id is not None and title:
        process_translation(doc_id, title)

# Start Kafka consumer in background
@app.on_event("startup")
async def startup_event():
    import threading
    print(f"Starting Kafka consumer with bootstrap servers: {KAFKA_BOOTSTRAP_SERVERS}")
    threading.Thread(
        target=kafka.consume_messages,
        args=("document_events", process_kafka_message),
        daemon=True,
        name="KafkaConsumerThread"
    ).start()
    print("Kafka consumer thread started")