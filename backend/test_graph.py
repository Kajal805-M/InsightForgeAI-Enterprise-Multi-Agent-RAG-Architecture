import asyncio
import os
import sys

# Set up path so imports work
sys.path.append(os.path.dirname(__file__))

from app.db.database import SessionLocal
from app.services.chat_service import stream_chat

async def main():
    db = SessionLocal()
    try:
        print("Starting stream...")
        async for chunk in stream_chat(session_id=1, query="tell me about uploaded document", db=db):
            print(chunk.strip())
    except Exception as e:
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(main())
