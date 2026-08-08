import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from app.core.config import settings

# Initialize Google Generative AI embeddings
# Using Gemini embeddings API instead of local HuggingFace to save memory (prevents OOM on Render Free Tier)
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001",
    google_api_key=settings.GEMINI_API_KEY
)

# Ensure the Chroma DB directory exists
os.makedirs(settings.CHROMA_DB_DIR, exist_ok=True)

# Initialize Chroma vector store
vector_store = Chroma(
    embedding_function=embeddings,
    persist_directory=settings.CHROMA_DB_DIR
)

def get_vector_store() -> Chroma:
    """
    Returns the singleton Chroma vector store instance.
    """
    return vector_store
