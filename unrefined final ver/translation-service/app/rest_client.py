import requests
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class DocumentServiceClient:
    def __init__(self, base_url: str, api_key: Optional[str] = None):
        self.base_url = base_url.rstrip('/')  # Remove trailing slash if present
        self.headers = {"Content-Type": "application/json"}
        if api_key:
            self.headers["Authorization"] = f"Bearer {api_key}"
    
    def update_translated_title(self, doc_id: int, translated_title: str) -> bool:
        """Update document with translated Spanish title via REST API"""
        try:
            url = f"{self.base_url}/api/v1/documents/{doc_id}/translate"
            logger.info(f"Sending translation update to {url}")
            
            response = requests.patch(
                url, 
                json={"titleEs": translated_title},
                headers=self.headers
            )
            
            if response.status_code == 200:
                logger.info(f"Successfully updated translation for document {doc_id}")
                return True
            else:
                logger.warning(f"Failed to update translation. Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            logger.error(f"Error updating translation via REST: {e}")
            return False