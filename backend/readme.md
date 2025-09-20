# LexAI Simplify – Backend

This service powers document upload, parsing, **AI-driven summarization**, clause explanation, **retrieval-augmented generation (RAG)**, PDF export, and **interactive Q\&A chat** with uploaded documents.

It integrates tightly with **Google Cloud (Vertex AI, Document AI, Storage)** for secure and scalable operations.

---

## Features

* Upload and process **PDF / DOCX / TXT**
* Summarize contracts, policies, and agreements with **Gemini (Google GenAI)**
* Extract key clauses, risks, and obligations
* Query documents using **RAG**
* Export AI summaries as PDFs to **Google Cloud Storage**
* Chat with your document (streaming Q\&A interface)

---

## Prerequisites

* Python **3.10+**
* Git
* Google Cloud SDK (`gcloud` CLI), authenticated
* A **Google Cloud project with billing enabled**

---

## Setup Guide

### 1. Clone Repository

```bash
git clone https://github.com/ArshCypherZ/LexAI.git
cd LexAI/backend
```

### 2. Install Dependencies

```bash
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

### 3. Configure Environment Variables

Copy template:

```bash
cp .env.example .env
```

---

### 4. Run the API Server

```bash
python main.py
```

* Server: `http://0.0.0.0:8000`
* Docs: `http://localhost:8000/docs` (Swagger UI)

---