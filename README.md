# Enterprise Multi-Agent RAG Platform 🚀

A highly-scalable, production-ready Business Intelligence platform built with **Python, FastAPI, LangGraph, and Vanilla JS**. It allows users to upload custom datasets and seamlessly chat with their documents through a Multi-Agent system powered by Gemini 1.5 Pro and ChromaDB.

## 🏗 Architecture

The platform follows a robust Microservice-oriented architecture separated into a fast API backend and an ultra-lightweight Vanilla JS frontend.

```mermaid
graph TD
    User([User]) --> |HTTP/SSE| NGINX[Frontend NGINX Proxy]
    NGINX --> |Static Files| SPA[Vite Vanilla JS SPA]
    NGINX --> |API Requests| FastAPI[FastAPI Backend]
    
    SPA --> |Render UI| Dashboard
    SPA --> |SSE Stream| ChatUI
    
    FastAPI --> |Ingest| SQLite[(SQLite Metadata DB)]
    FastAPI --> |Vectorize| Chroma[(ChromaDB Vector Store)]
    FastAPI --> |Analytics| Pandas[Pandas Engine]
    
    FastAPI --> LangGraph[LangGraph State Machine]
    
    LangGraph --> |Analyze| PlannerAgent
    LangGraph --> |Search Context| RetrieverAgent
    LangGraph --> |Crunch Data| AnalysisAgent
    LangGraph --> |Format| ReportAgent
    LangGraph --> |Reflect| CriticAgent
    
    RetrieverAgent --> Chroma
    ReportAgent --> |Generate PDF| xhtml2pdf
    
    LangGraph <--> |API| Gemini[Google Gemini 1.5 Pro API]
```

## 📂 Folder Structure

```text
enterprise-rag-platform/
├── backend/
│   ├── app/
│   │   ├── agents/      # LangGraph Multi-Agent orchestration
│   │   ├── api/         # FastAPI REST endpoints
│   │   ├── core/        # Configuration, Exceptions, Logging
│   │   ├── db/          # SQLite models and ChromaDB setup
│   │   └── services/    # Business logic (Analytics, Chat, Reports, Document processing)
│   ├── tests/           # Pytest API integration tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI elements (Skeleton, Buttons)
│   │   ├── layouts/     # Dashboard container layout
│   │   ├── pages/       # SPA Views (Chat, Analytics, Reports, Documents)
│   │   └── services/    # Axios API client
│   ├── tests/           # Vitest unit tests
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── render.yaml
└── .env.example
```

## 📖 API Documentation

The backend auto-generates interactive Swagger API documentation.
Once running, navigate to: `http://localhost:8000/docs`

Key Endpoints:
- `POST /api/v1/documents/upload`: Ingests and vectorizes CSV/TXT/PDF files in the background.
- `GET /api/v1/system/status`: Returns comprehensive system metrics.
- `POST /api/v1/chat/{session_id}/stream`: Opens a Server-Sent Events (SSE) stream for real-time AI inference.
- `POST /api/v1/reports/generate/{document_id}`: Synthesizes a Business Executive PDF report.

## 🚀 Installation & Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/enterprise-rag-platform.git
   cd enterprise-rag-platform
   ```

2. **Configure Environment:**
   Copy the example config and add your Gemini API Key.
   ```bash
   cp .env.example .env
   # Edit .env and insert GEMINI_API_KEY
   ```

3. **Run with Docker Compose (Recommended):**
   ```bash
   docker compose up --build
   ```
   The platform will be available at `http://localhost`.

## ☁️ Deployment Guide (Render.com)

This repository includes a `render.yaml` Blueprint for 1-click cloud deployment.

1. Ensure the repo is pushed to GitHub.
2. Log into [Render](https://render.com) and create a **New Blueprint Instance**.
3. Select your repository. Render will automatically provision two Web Services (one for the FastAPI backend, one for the NGINX frontend).
4. Add your `GEMINI_API_KEY` to the Render Environment Variables dashboard.

## 🔮 Future Roadmap

- [ ] Add user authentication (OAuth2 / JWT).
- [ ] Support PostgreSQL as a highly-concurrent alternative to SQLite.
- [ ] Introduce real-time WebSockets for multi-user collaborative chat.
- [ ] Integrate additional Agent Nodes (e.g., Code Execution Agent, Web Search Agent).

## 🤝 Contributing

We welcome contributions! Please see the `CONTRIBUTING.md` file for code formatting standards and PR submission guidelines.

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.
