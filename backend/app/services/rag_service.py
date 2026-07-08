import logging
from typing import List, Dict, Any
from app.db.vector_store import get_vector_store
from app.rag.loaders import load_document
from app.rag.splitter import split_documents

logger = logging.getLogger(__name__)

def ingest_document(file_path: str, file_type: str, document_id: int, filename: str) -> None:
    """
    RAG Ingestion Pipeline: Load -> Split -> Embed -> Store in ChromaDB
    """
    try:
        logger.info(f"Starting RAG ingestion for document {document_id} ({filename})")
        
        # 1. Load
        raw_docs = load_document(file_path, file_type)
        logger.info(f"Loaded {len(raw_docs)} raw chunks/pages from document {document_id}")
        
        # 2. Contextual Chunking
        metadata = {
            "document_id": document_id,
            "filename": filename,
            "file_type": file_type
        }
        chunks = split_documents(raw_docs, metadata)
        logger.info(f"Split document {document_id} into {len(chunks)} contextual chunks")
        
        # 3. Store Embeddings
        vector_store = get_vector_store()
        vector_store.add_documents(chunks)
        logger.info(f"Successfully ingested document {document_id} into ChromaDB")
        
    except Exception as e:
        logger.error(f"Error during RAG ingestion for document {document_id}: {str(e)}")
        raise e

def search_context(query: str, limit: int = 5, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    """
    Similarity Search: Queries ChromaDB and returns top matching chunks with citations.
    Supports metadata filtering (e.g., {"document_id": 123}).
    """
    vector_store = get_vector_store()
    
    # Langchain Chroma supports metadata filtering via the `filter` kwarg
    results = vector_store.similarity_search_with_score(
        query=query, 
        k=limit,
        filter=filters
    )
    
    # Format the results to clearly expose citation metadata for the frontend
    formatted_results = []
    for doc, score in results:
        formatted_results.append({
            "content": doc.page_content,
            "metadata": doc.metadata,
            "similarity_score": score # L2 distance: lower score means higher similarity
        })
        
    return formatted_results
