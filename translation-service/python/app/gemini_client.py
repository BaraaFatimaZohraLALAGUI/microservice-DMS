import time
import re
import sys
from typing import Optional

import google.generativeai as genai

GEMINI_API_KEY='AIzaSyAlSmyOjBZdoDUB0pI9_mRrMH26vq9gv5E'

class GeminiTranslator:
    def __init__(self):
        self.client = genai.configure(api_key=GEMINI_API_KEY)
    
    def translate_text(self, text: str, target_language: str, max_retries: int = 3) -> Optional[str]:
        delay = 1
        for attempt in range(max_retries):
            try:

                prompt = f"""You are a professional translator. Accurately translate the following text to {target_language}, 
                keeping it colloquial and natural. Return ONLY the translation without any additional text or explanations.
                
                Text to translate: {text}"""
                
                response = self.client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=[{"parts": [{"text": prompt}]}]
                )
                return self._clean_translation(response.text)
            except Exception as e:
                if "429" in str(e):
                    print(f"Rate limit exceeded, retrying in {delay} seconds (attempt {attempt + 1}/{max_retries})")
                    time.sleep(delay)
                    delay *= 2  
                else:
                    print(f"Translation error: {str(e)}")
                    return text
        print(f"Failed to translate after {max_retries} attempts")
        return text
    
    def _clean_translation(self, text: str) -> str:
            translation = text.split('\n')[0].strip()
            patterns = [
                r'^.*?(?:translation|translate|here\s*(?:is|are)|this\s*is)[:\s]*',
                r'^[\*\-"]+\s*',
                r'\s*\(.*?\)\s*',
                r'\s*\[.*?\]\s*'
            ]
            
            for pattern in patterns:
                translation = re.sub(pattern, '', translation, flags=re.IGNORECASE)
                
            return translation.strip()