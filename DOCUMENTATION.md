# SRS Generation & AI Chat Application

## Overview
A modern Next.js application with a local AI-style chatbot featuring:
- **Local Response Strategy**: No external AI providers
- **Rules & Verification**: Input validation and output content filtering
- **Professional UI Design**: Tailwind CSS with dark mode
- **Custom Tailwind Theme**: Primary colors, custom fonts, rounded borders
- **Dataset Integration (Local RAG)**: Ingest and search your own knowledge base for grounded answers

## Project Structure
```
src/
├── app/
│   ├── layout.tsx           # Root layout with Manrope font
│   ├── page.tsx             # Homepage
│   ├── globals.css          # Global styles & Tailwind import
│   ├── chat/
│   │   └── page.tsx         # Chat UI with sidebar
│   ├── dataset/
│   │   └── page.tsx         # Dataset manager (ingest/search/clear)
│   └── api/
│       ├── chat/
│       │   ├── route.ts     # Local chat endpoint (RAG-aware)
│       │   └── gemini/route.ts # Deprecated 410 response
│       ├── dataset/
│       │   ├── ingest/route.ts # Ingest text into local store
│       │   ├── search/route.ts # Search similar chunks
│       │   └── clear/route.ts  # Clear store
│       └── health/
│           └── env/
│               └── route.ts # Health check (no external providers)
├── lib/
│   ├── types.ts             # TypeScript types (Message, Role, etc.)
│   ├── rules.ts             # Rules engine (applyRules, verifyResponse)
│   └── rag/
│       ├── embeddings.ts    # Local tokenization & TF cosine similarity
│       └── store.ts         # JSON vector store (persisted in .data)
├── tailwind.config.ts       # Tailwind configuration
└── next.config.ts           # Next.js configuration
```

## Features

### 1. Chat Interface
- Three-panel layout with sidebar, message area, info panel
- Dark mode and smooth transitions
- Loading and error states
- "Use Dataset" toggle to enrich responses with local context

### 2. Dataset (Local RAG)
- Visit `/dataset` to ingest text, search, or clear the store
- Chat route searches similar chunks and injects them as system context when enabled
- No external keys required

### 3. Rules & Verification
Same as before: input rules and output verification with response allowability and warnings via headers.

## Getting Started

### Installation
```bash
npm install
npm run dev
```

Visit:
- Chat: `http://localhost:3000/chat`
- Dataset: `http://localhost:3000/dataset`
- Health Check: `http://localhost:3000/api/health/env`

### Production Build
```bash
npm run build
npm run start
```

## Next Steps
- Optionally plug in a vector database (pgvector, Pinecone) for scale
- Add document upload and parsers (PDF, DOCX)
- Implement streaming responses or local LLM if desired

## Troubleshooting
- If dataset results are poor, add more detailed, relevant text
- For large inputs, consider chunk size tuning in `store.ts`
