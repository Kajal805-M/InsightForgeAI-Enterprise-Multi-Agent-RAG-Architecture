import os
import pandas as pd
from typing import List
from langchain_core.documents import Document
from langchain_community.document_loaders import (
    PyPDFLoader,
    Docx2txtLoader,
    TextLoader,
    CSVLoader
)
from app.core.exceptions import AppException

def load_document(file_path: str, file_type: str) -> List[Document]:
    """
    Selects the appropriate LangChain Document Loader based on file type.
    """
    if not os.path.exists(file_path):
        raise AppException(message=f"File not found: {file_path}", status_code=404)

    file_type = file_type.upper()
    
    try:
        if file_type == "PDF":
            loader = PyPDFLoader(file_path)
            return loader.load()
        elif file_type == "DOCX":
            loader = Docx2txtLoader(file_path)
            return loader.load()
        elif file_type == "TXT":
            loader = TextLoader(file_path)
            return loader.load()
        elif file_type == "CSV":
            loader = CSVLoader(file_path)
            return loader.load()
        elif file_type == "XLSX":
            # For Excel, we use pandas to read and convert to text representation
            df = pd.read_excel(file_path)
            content = df.to_string(index=False)
            return [Document(page_content=content, metadata={"source": file_path})]
        else:
            raise AppException(message=f"Unsupported document loader type: {file_type}")

    except Exception as e:
        raise AppException(message=f"Failed to load document: {str(e)}", status_code=500)
