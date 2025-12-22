# SRS Generation & AI Chat Application

## Overview
A modern Next.js application with an AI-powered chatbot featuring:
- **Dual AI Provider Support**: OpenAI and Google Gemini
- **Advanced Rules & Verification**: Input validation and output content filtering
- **Professional UI Design**: Built with Tailwind CSS with dark mode support
- **Custom Tailwind Theme**: Primary colors, custom fonts, and rounded borders

## Project Structure
```
src/
├── app/
│   ├── layout.tsx           # Root layout with Manrope font
│   ├── page.tsx             # Homepage
│   ├── globals.css          # Global styles & Tailwind import
│   ├── chat/
│   │   └── page.tsx         # Full-featured chat UI with sidebar
│   └── api/
│       ├── chat/
│       │   ├── route.ts     # OpenAI API endpoint
│       │   └── gemini/
│       │       └── route.ts # Gemini API endpoint
│       └── health/
│           └── env/
│               └── route.ts # Health check for env vars
├── lib/
│   ├── types.ts             # TypeScript types (Message, Role, etc.)
│   └── rules.ts             # Rules engine (applyRules, verifyResponse)
├── tailwind.config.ts       # Tailwind configuration
└── next.config.ts           # Next.js configuration
```

## Features

### 1. Chat Interface
- **Three-Panel Layout**:
  - Left Sidebar: Navigation, recent chats, user profile
  - Center: Message feed with user/assistant distinction
  - Right Sidebar: Chat metadata, configuration, features

- **Responsive Design**: Works on desktop; mobile refinement recommended
- **Dark Mode**: Built-in support with smooth transitions
- **Real-time Indicators**: Loading states, active status, message count

### 2. AI Providers
- **OpenAI** (default):
  - Endpoint: `/api/chat`
  - Model: `gpt-4o-mini`
  - Runtime: Edge

- **Google Gemini**:
  - Endpoint: `/api/chat/gemini`
  - Model: `gemini-1.5-flash` (configurable)
  - Runtime: Node.js

Switch providers via the Provider dropdown in the header.

### 3. Rules & Verification

**Input Rules** (`applyRules` function):
- Maximum input length: 4,000 characters (truncated with warning)
- Secret detection: Flags potential API keys, passwords, tokens
- Input trimming and normalization

**Output Verification** (`verifyResponse` function):
- Maximum response length: 10,000 characters (truncated with warning)
- Profanity detection: Basic word filtering (configurable)
- Response allowability flag: Block responses if needed

Both rules and warnings are exposed via HTTP headers:
- `X-Chat-Violations`: Input rule violations
- `X-Chat-Warnings`: Response warnings

### 4. Tailwind Styling
**Custom Theme** (tailwind.config.ts):
- **Primary Color**: `#1337ec` (Blue)
- **Background**: Light (`#f6f6f8`) & Dark (`#101322`)
- **Font**: Manrope (imported from Google Fonts)
- **Border Radius**: Custom values (DEFAULT: 0.25rem, lg: 0.5rem, xl: 0.75rem)

Usage:
```tsx
<div className="bg-primary text-white rounded-lg">
  Styled with custom theme
</div>
```

### 5. Environment Variables
Create or update `.env.local`:
```
OPENAI_API_KEY=sk-your-openai-key-here
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-key-here
```

**Health Check**: Visit `/api/health/env` to verify environment variables are loaded:
```json
{ "ok": true, "hasOpenAI": true, "hasGemini": true }
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenAI API key (https://platform.openai.com/api-keys)
- Google Gemini API key (https://makersuite.google.com/app/apikey)

### Installation
```bash
cd srs-generation-app
npm install
npm run dev
```

Visit:
- Chat: `http://localhost:3000/chat`
- Health Check: `http://localhost:3000/api/health/env`

### Production Build
```bash
npm run build
npm run start
```

## Customization

### Modify Rules
Edit `src/lib/rules.ts`:
- `applyRules()`: Add input validations, transformations
- `verifyResponse()`: Add output filters, set `isAllowable = false` to block

Example: Block responses containing "banned word"
```typescript
if (response.includes('banned word')) {
  isAllowable = false;
  warnings.push('Response contains blocked content.');
}
```

### Extend Theme Colors
In `tailwind.config.ts`:
```typescript
colors: {
  primary: '#1337ec',
  secondary: '#ff6b35',
  accent: '#f7931e',
}
```

### Change AI Model
- **OpenAI**: Update `model: 'gpt-4'` in `src/app/api/chat/route.ts`
- **Gemini**: Pass `{ model: 'gemini-2.0-flash' }` in chat request body

## API Reference

### POST `/api/chat` (OpenAI)
Request:
```json
{ "messages": [{ "role": "user", "content": "Hello" }] }
```

Response:
```json
{
  "ok": true,
  "message": { "role": "assistant", "content": "Hi there!" },
  "error": null
}
```

### POST `/api/chat/gemini` (Gemini)
Same request/response schema as OpenAI endpoint.

### GET `/api/health/env`
Returns environment variable availability (no secrets exposed):
```json
{ "ok": true, "hasOpenAI": true, "hasGemini": false }
```

## Next Steps

1. **Add Chat History**: Persist messages to a database (Supabase, Firebase, etc.)
2. **Streaming Responses**: Enable real-time response streaming for better UX
3. **File Upload**: Support document uploads for context
4. **User Authentication**: Add Clerk or Auth0 for multi-user support
5. **Advanced Rules**: Implement prompt injection defense, context filtering
6. **Analytics**: Track usage, errors, and performance metrics
7. **Mobile Responsive**: Optimize sidebar/layout for mobile devices

## Troubleshooting

**Missing API Key Error**:
- Ensure `.env.local` is in `srs-generation-app/` directory
- Check spelling: `OPENAI_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`
- Restart the dev server after adding env variables
- Visit `/api/health/env` to verify they're loaded

**Build Errors**:
- Run `npm run lint` to check for linting issues
- Check console for TypeScript errors
- Ensure all dependencies are installed: `npm install`

**Provider Not Responding**:
- Verify API keys are valid
- Check API quota/rate limits
- Review browser console for fetch errors
- Check server logs for detailed error messages

## Tech Stack
- **Framework**: Next.js 16 (with Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **AI**: OpenAI SDK, Google Generative AI SDK
- **Font**: Manrope (Google Fonts)
- **Runtime**: Edge (OpenAI), Node.js (Gemini)

---

**Last Updated**: December 22, 2025
**Status**: Production-Ready ✅

