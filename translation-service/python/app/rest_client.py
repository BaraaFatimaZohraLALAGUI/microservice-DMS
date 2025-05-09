import requests
from typing import Optional

class DocumentServiceClient:
    def __init__(self, base_url: str, api_key: Optional[str] = None):
        self.base_url = base_url
        self.headers = {}
        if api_key:
            self.headers["Authorization"] = f"Bearer {api_key}"
    
    def update_translated_title(self, doc_id: str, translated_title: str) -> bool:
        """Update document with translated Spanish title via REST API"""
        try:
            url = f"{self.base_url}/api/v1/documents/{doc_id}/translate"
            response = requests.patch(
                url, 
                json={"titleEs": translated_title},
                headers=self.headers
            )
            return response.status_code == 200
        except Exception as e:
            print(f"Error updating translation via REST: {e}")
            return False