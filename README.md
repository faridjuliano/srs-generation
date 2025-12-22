# Next.js + Tailwind Chat + Local Dataset

This is a Next.js app (App Router + Tailwind) that includes:
- A clean chat UI (`/chat`) with rules/verification
- A local dataset manager (`/dataset`) for Retrieval-Augmented responses
- No external AI providers required

## Setup

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Chatbot

- Chat UI: `/chat`
- Backend API route: `/api/chat` (local-only, optional dataset grounding)
- Shared types: `src/lib/types.ts`
- Rules & verification: `src/lib/rules.ts`

## Dataset (Local RAG)

- Manage content at `/dataset` (ingest/search/clear)
- API routes under `/api/dataset/*`
- Store persisted at `.data/vector-store.json`

Example ingest:

```bash
curl -sS -X POST http://localhost:3000/api/dataset/ingest \
  -H 'Content-Type: application/json' \
  -d '{"text":"The system must support SSO via SAML2.", "source":"Security Spec"}'
```

Example search:

```bash
curl -sS -X POST http://localhost:3000/api/dataset/search \
  -H 'Content-Type: application/json' \
  -d '{"query":"How do we login?"}'
```

## Smoke Test

With the dev server running:

```bash
curl -sS -X POST http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Say hello"}]}' | jq
```

You should see an assistant message in the JSON.

## Notes

- Local similarity uses tokenization + TF cosine (see `src/lib/rag/embeddings.ts`)
- Chat response is rule-checked and either echoes the prompt or indicates found context
- Tailwind styles are in `src/app/globals.css`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)

## Deploy on Vercel

Follow official [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying).
