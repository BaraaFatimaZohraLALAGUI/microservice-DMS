import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()  


class SupabaseClient:
    def __init__(self):
        # self.url = os.getenv("SUPABASE_URL")
        # self.key = os.getenv("SUPABASE_KEY")
        self.url = "https://aumpuplymcmpzmydufam.supabase.co"
        self.key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1bXB1cGx5bWNtcHpteWR1ZmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNDIyMTAsImV4cCI6MjA2MTcxODIxMH0.iToaB_srZX3nIse2TLTxy59obOqnoJo4l3x-DpGDsdY"
        if not self.url or not self.key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY are required")

        self.client =  create_client(self.url, self.key)
        
        # Verify connection
        try:
            self.client.table("Documents").select("*").limit(1).execute()
        except Exception as e:
            raise ConnectionError(f"Supabase connection failed: {str(e)}")

    def get_document_title(self, doc_id: str) -> str:
        """Fetch document title from Supabase"""
        try:
            response = (self.client.table("Documents")
                       .select("title")
                       .eq("id", doc_id)
                       .execute())
            
            if response.data and len(response.data) > 0:
                return response.data[0]["title"]
            return ' '
            
        except Exception as e:
            print(f"Error fetching document: {e}")
            raise

    def update_translated_title(self, doc_id: str, translated_title: str):
        """Update document with translated title"""
        try:
            (self.client.table("Documents")
             .update({"translated_title": translated_title})
             .eq("id", doc_id)
             .execute())
        except Exception as e:
            print(f"Error updating document: {e}")
            raise