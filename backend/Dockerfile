# Use slim python image to minimize footprint
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for xhtml2pdf and chromadb
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Ensure storage directories exist
RUN mkdir -p uploads/reports chroma_db

# Expose FastAPI port
EXPOSE 8000

# Run uvicorn production server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
