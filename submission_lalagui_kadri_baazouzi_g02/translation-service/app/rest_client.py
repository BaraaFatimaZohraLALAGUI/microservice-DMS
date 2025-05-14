import requests
from typing import Optional
import logging
import time

logger = logging.getLogger(__name__)

class DocumentServiceClient:
    def __init__(self, base_url: str, api_key: Optional[str] = None, timeout: int = 5):
        self.base_url = base_url.rstrip('/')  # Remove trailing slash if present
        self.headers = {"Content-Type": "application/json"}
        self.timeout = timeout  # Connection timeout in seconds
        
        if api_key:
            self.headers["Authorization"] = f"Bearer {api_key}"
            
        # Test connection during initialization
        self._test_connection()
    
    def _test_connection(self) -> bool:
        """Test if we can connect to the document service"""
        try:
            # Try a simple HEAD request to the base URL
            response = requests.head(
                f"{self.base_url}/actuator/health", 
                headers=self.headers,
                timeout=self.timeout
            )
            logger.info(f"Document service connection test: {response.status_code}")
            return response.status_code < 500  # Accept any non-server error
        except requests.RequestException as e:
            logger.warning(f"Document service connection test failed: {e}")
            return False
    
    def update_translated_title(self, doc_id: int, translated_title: str) -> bool:
        """Update document with translated Spanish title via REST API"""
        max_retries = 3
        retry_delay = 1  # Initial delay in seconds
        
        for attempt in range(max_retries):
            try:
                url = f"{self.base_url}/api/v1/documents/{doc_id}/translate"
                logger.info(f"Sending translation update to {url}")
                
                response = requests.patch(
                    url, 
                    json={"titleEs": translated_title},
                    headers=self.headers,
                    timeout=self.timeout
                )
                
                if response.status_code == 200:
                    logger.info(f"Successfully updated translation for document {doc_id}")
                    return True
                else:
                    logger.warning(f"Failed to update translation. Status: {response.status_code}, Response: {response.text}")
                    
                    # Don't retry for client errors (4xx) except 429 (rate limit)
                    if 400 <= response.status_code < 500 and response.status_code != 429:
                        return False
                        
                    # Exponential backoff for server errors and rate limits
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Double the delay for next attempt
            except requests.Timeout:
                logger.warning(f"Timeout connecting to document service (attempt {attempt+1}/{max_retries})")
                time.sleep(retry_delay)
                retry_delay *= 2
            except Exception as e:
                logger.error(f"Error updating translation via REST: {e}")
                time.sleep(retry_delay)
                retry_delay *= 2
                
        return False  # All retries failed