"""
Import and re-export app from app.main for compatibility with Dockerfile CMD
"""
from app.main import app

# When this file is executed directly, run the app with Uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8002, reload=True) 