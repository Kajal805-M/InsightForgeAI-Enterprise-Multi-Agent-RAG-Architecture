import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from app.core.config import settings

# Initialize Hugging Face embeddings
# Using a fast, local sentence-transformer model by default
embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)

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
