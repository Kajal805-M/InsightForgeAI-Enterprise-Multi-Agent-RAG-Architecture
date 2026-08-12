<div align="center">

# 🚀 InsightForge AI

### Enterprise Multi-Agent RAG Architecture

**A production-ready Business Intelligence platform that lets you upload your data and *talk* to it —
powered by a Multi-Agent system, Gemini 1.5 Pro, and ChromaDB.**

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Multi--Agent-1C3C3C?style=for-the-badge)](https://www.langchain.com/langgraph)
[![Gemini](https://img.shields.io/badge/Gemini_1.5_Pro-AI_Engine-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[**🌐 Live Demo**](#-live-demo) • [**📖 API Docs**](#-api-documentation) • [**🏗 Architecture**](#-architecture) • [**🚀 Quick Start**](#-installation--local-development)

</div>

---

## ✨ Overview

**InsightForge AI** is a highly-scalable, enterprise-grade RAG (Retrieval-Augmented Generation) platform built with **Python, FastAPI, LangGraph, and Vanilla JS**. Upload your own datasets — CSV, TXT, or PDF — and chat with them in real time through a coordinated team of AI agents, each specialized in a distinct part of the reasoning pipeline.

It's wrapped in a premium **glassmorphism UI**, backed by vector search, and ships with everything needed to go from `git clone` to a live cloud deployment in minutes.

## 🌐 Live Demo

> 🔗 **[Add your live demo link here]** — e.g. `https://insightforge-ai.onrender.com`
>
> Once deployed via the included Render Blueprint (see [Deployment Guide](#️-deployment-guide-rendercom)), replace this placeholder with your public URL so visitors can try it instantly.

## 🌟 Key Features

| | |
|---|---|
| 🤖 **Multi-Agent Reasoning** | Planner, Retriever, Analysis, Report, and Critic agents collaborate via a LangGraph state machine |
| 📄 **Document Ingestion** | Upload and vectorize CSV, TXT, and PDF files in the background |
| 🔍 **Vector Search** | Fast, relevant context retrieval powered by ChromaDB |
| 💬 **Real-Time Chat** | Server-Sent Events (SSE) streaming for responsive, live AI conversations |
| 📊 **Executive Reports** | One-click PDF report generation synthesized from your data |
| 🎨 **Premium UI** | Lightweight, fast glassmorphism interface built with Vanilla JS + Vite |
| 🐳 **Docker-Native** | Fully containerized backend + frontend, ready for local or cloud deployment |
| ☁️ **1-Click Cloud Deploy** | Built-in `render.yaml` Blueprint for instant Render.com deployment |

## 🏗 Architecture

InsightForge AI follows a robust **microservice-oriented architecture**, cleanly separating a FastAPI backend from an ultra-lightweight Vanilla JS frontend.

```mermaid
graph TD
    User([User]) -->|HTTP/SSE| NGINX[Frontend NGINX Proxy]
    NGINX -->|Static Files| SPA[Vite Vanilla JS SPA]
    NGINX -->|API Requests| FastAPI[FastAPI Backend]

    SPA -->|Render UI| Dashboard
    SPA -->|SSE Stream| ChatUI

    FastAPI -->|Ingest| SQLite[(SQLite Metadata DB)]
    FastAPI -->|Vectorize| Chroma[(ChromaDB Vector Store)]
    FastAPI -->|Analytics| Pandas[Pandas Engine]

    FastAPI --> LangGraph[LangGraph State Machine]

    LangGraph -->|Analyze| PlannerAgent
    LangGraph -->|Search Context| RetrieverAgent
    LangGraph -->|Crunch Data| AnalysisAgent
    LangGraph -->|Format| ReportAgent
    LangGraph -->|Reflect| CriticAgent

    RetrieverAgent --> Chroma
    ReportAgent -->|Generate PDF| xhtml2pdf

    LangGraph <-->|API| Gemini[Google Gemini 1.5 Pro API]
```

### 🧠 The Agent Pipeline

1. **Planner Agent** — breaks down the user's query into an actionable plan
2. **Retriever Agent** — searches ChromaDB for the most relevant document context
3. **Analysis Agent** — crunches numbers and extracts insights via Pandas
4. **Report Agent** — formats findings, optionally generating a PDF report
5. **Critic Agent** — reflects on the output for accuracy and quality before responding

## 📂 Folder Structure

```
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

The backend auto-generates interactive Swagger docs. Once running, navigate to:

```
http://localhost:8000/docs
```

### Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/documents/upload` | Ingests and vectorizes CSV/TXT/PDF files in the background |
| `GET` | `/api/v1/system/status` | Returns comprehensive system metrics |
| `POST` | `/api/v1/chat/{session_id}/stream` | Opens an SSE stream for real-time AI inference |
| `POST` | `/api/v1/reports/generate/{document_id}` | Synthesizes a Business Executive PDF report |

## 🚀 Installation & Local Development

### 1. Clone the repository

```bash
git clone https://github.com/Kajal805-M/InsightForgeAI-Enterprise-Multi-Agent-RAG-Architecture.git
cd InsightForgeAI-Enterprise-Multi-Agent-RAG-Architecture
```

### 2. Configure environment

Copy the example config and add your Gemini API key.

```bash
cp .env.example .env
# Edit .env and insert GEMINI_API_KEY
```

### 3. Run with Docker Compose (recommended)

```bash
docker compose up --build
```

The platform will be available at **`http://localhost`** 🎉

## ☁️ Deployment Guide (Render.com)

This repository ships with a `render.yaml` Blueprint for 1-click cloud deployment.

1. Push the repo to GitHub.
2. Log into [Render](https://render.com) and create a **New Blueprint Instance**.
3. Select your repository — Render automatically provisions two web services (FastAPI backend + NGINX frontend).
4. Add your `GEMINI_API_KEY` in the Render Environment Variables dashboard.
5. Deploy, then update the [Live Demo](#-live-demo) link above with your public URL 🚀

## 🔮 Future Roadmap

- [ ] User authentication (OAuth2 / JWT)
- [ ] PostgreSQL support as a highly-concurrent alternative to SQLite
- [ ] Real-time WebSockets for multi-user collaborative chat
- [ ] Additional agent nodes (e.g., Code Execution Agent, Web Search Agent)

## 🛠 Tech Stack

<div align="left">

![Python](https://img.shields.io/badge/-Python-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![LangGraph](https://img.shields.io/badge/-LangGraph-1C3C3C?style=flat-square)
![Gemini](https://img.shields.io/badge/-Gemini_1.5_Pro-8E75B2?style=flat-square&logo=google-gemini&logoColor=white)
![ChromaDB](https://img.shields.io/badge/-ChromaDB-FF6F00?style=flat-square)
![SQLite](https://img.shields.io/badge/-SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)
![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![NGINX](https://img.shields.io/badge/-NGINX-009639?style=flat-square&logo=nginx&logoColor=white)

</div>

## 🤝 Contributing

Contributions are welcome! Please see [`CONTRIBUTING.md`](CONTRIBUTING.md) for code formatting standards and PR submission guidelines.

## 📄 License

This project is licensed under the **MIT License** — see the [`LICENSE`](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by [Kajal805-M](https://github.com/Kajal805-M)

</div>
