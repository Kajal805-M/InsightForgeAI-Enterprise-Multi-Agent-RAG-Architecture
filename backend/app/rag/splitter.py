from typing import List
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

def split_documents(documents: List[Document], metadata: dict) -> List[Document]:
    """
    Splits documents into chunks using RecursiveCharacterTextSplitter.
    Implements Contextual Chunking by injecting comprehensive metadata into every chunk
    for robust citation support and metadata filtering.
    """
    # 1000 characters chunk with 200 character overlap preserves context boundaries well
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        is_separator_regex=False,
    )
    
    chunks = splitter.split_documents(documents)
    
    # Contextual Chunking: Ensure all chunks have the parent metadata attached
    for chunk in chunks:
        # Merge existing metadata (like 'page' from PyPDFLoader) with custom metadata
        chunk.metadata.update(metadata)
        
    return chunks
