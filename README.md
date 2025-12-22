# Next.js + Tailwind AI Chatbot

This is a Next.js app bootstrapped with `create-next-app` (App Router + Tailwind) that includes a simple AI chatbot page and backend API leveraging the OpenAI API.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` in the project root and add your OpenAI key:

```bash
OPENAI_API_KEY=your_api_key_here
```

3. Run the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Chatbot

- Chat UI located at `/chat`.
- Backend API route: `/api/chat`.
- Shared types in `src/lib/types.ts`.
- Rules and verification functions in `src/lib/rules.ts` to customize later.

## API

POST `/api/chat`

Body:

```json
{
  "messages": [
    { "role": "user", "content": "Hello" }
  ]
}
```

Response:

```json
{
  "ok": true,
  "message": { "role": "assistant", "content": "..." }
}
```

Headers include `X-Chat-Violations` and `X-Chat-Warnings` from rules/verification.

## Smoke Test

With the dev server running:

```bash
curl -sS -X POST http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Say hello"}]}' | jq
```

If successful, you should see an assistant message in the JSON.

## Notes

- Uses the official `openai` SDK.
- The API route is configured for `runtime = 'edge'`.
- Tailwind is preconfigured by the template; styles are in `src/app/globals.css`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
