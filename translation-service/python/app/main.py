from fastapi import FastAPI
from .supabase_client import SupabaseClient
from .gemini_client import GeminiTranslator
from .kafka_handler import KafkaHandler
import os


app = FastAPI()
supabase = SupabaseClient()
translator = GeminiTranslator()
kafka = KafkaHandler(os.getenv("KAFKA_BOOTSTRAP_SERVERS"))

@app.post("/translate/{doc_id}")
async def translate_document(doc_id: str):
    """Endpoint for manual translation triggering"""
    title = supabase.get_document_title(doc_id)
    if not title:
        return {"error": "Document not found"}
    
    translated = translator.translate_text(title, "Spanish")
    supabase.update_translated_title(doc_id, translated)
    return {"translation": translated}

def process_kafka_message(message: dict):
    """Callback for Kafka consumer"""
    doc_id = message["doc_id"]
    title = supabase.get_document_title(doc_id)
    if title:
        translated = translator.translate_text(title, "Spanish")
        supabase.update_translated_title(doc_id, translated)
        # Optionally notify via Kafka
        kafka.send_translation_result(doc_id, translated)

# Start Kafka consumer in background
if __name__ == "__main__":
    import threading
    threading.Thread(
        target=kafka.consume_messages,
        args=("document-translation-requests", process_kafka_message),
        daemon=True
    ).start()