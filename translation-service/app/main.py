from fastapi import FastAPI
from .gemini_client import GeminiTranslator
from .kafka_handler import KafkaHandler
from .rest_client import DocumentServiceClient
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
translator = GeminiTranslator()
kafka = KafkaHandler(os.getenv("KAFKA_BOOTSTRAP_SERVERS"))
document_service = DocumentServiceClient(
    os.getenv("DOCUMENT_SERVICE_URL", "http://localhost:8080"),
    os.getenv("DOCUMENT_SERVICE_API_KEY")
)

# The REST approach for handling translations
def process_translation(doc_id: str, title: str) -> str:
    """Process translation and update document service"""
    translated = translator.translate_text(title, "Spanish")
    if translated:
        # Try REST API first
        success = document_service.update_translated_title(doc_id, translated)
        if not success:
            # Fallback to Kafka
            kafka.send_translation_result(doc_id, translated)
    return translated

@app.post("/translate/{doc_id}")
async def translate_document(doc_id: str, title: str = None):
    """Endpoint for manual translation triggering"""
    if not title:
        return {"error": "Title is required"}
    
    translated = process_translation(doc_id, title)
    return {"translation": translated}

def process_kafka_message(message: dict):
    """Callback for Kafka consumer"""
    doc_id = message.get("documentId")
    title = message.get("titleEn")
    
    if doc_id and title:
        process_translation(doc_id, title)

# Start Kafka consumer in background
if __name__ == "__main__":
    import threading
    threading.Thread(
        target=kafka.consume_messages,
        args=("document-translation-requests", process_kafka_message),
        daemon=True
    ).start()