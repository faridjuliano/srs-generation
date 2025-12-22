import { NextResponse } from 'next/server';
import * as rules from '@/lib/rules';
import { ChatRequestBody, ChatResponseBody, Message } from '@/lib/types';
import { searchSimilar } from '@/lib/rag/store';
import { z } from 'zod';
import { searchPure } from '@/lib/pureSearch';

const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
    }),
  ).optional(),
  message: z.string().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    )
    .optional(),
  useRag: z.boolean().optional(),
  topK: z.number().int().positive().max(50).optional(),
});

function buildRetrievalQuery(message: string, history?: { role: string; content: string }[]) {
  const userTurns = (history ?? []).filter((h) => h.role === 'user').slice(-2);
  const parts = [...userTurns.map((h) => h.content), message];
  return parts.filter(Boolean).join(' \n ');
}

function buildSrsSkeleton(message: string, retrievedText: string[]) {
  const frLines = retrievedText.slice(0, 8).map((t, i) => `- FR${i + 1}: ${t}`);
  const nfrLines = [
    '- Performance: Define response times, throughput, and scalability targets.',
    '- Security: Authentication, authorization, logging, and data protection expectations.',
    '- Usability: Accessibility, localization, and error feedback considerations.',
    '- Reliability: Uptime, backups, and failure recovery notes.',
  ];
  return [
    '# Software Requirements Specification (Draft)',
    '## Introduction',
    `Context: ${message}`,
    '## Overall Description',
    'Summarize system purpose, users, and scope. Refine with stakeholder input.',
    '## Functional Requirements',
    ...(frLines.length ? frLines : ['- List key functional requirements here.']),
    '## Non-Functional Requirements',
    ...nfrLines,
    '## Assumptions / Questions',
    '- Clarify actors, data sources, integrations, constraints, and acceptance criteria.',
  ].join('\n');
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = chatSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
    }

    // Preserve existing message-based flow
    const body = parsed.data as ChatRequestBody & { message?: string; history?: { role: string; content: string }[]; useRag?: boolean; topK?: number };
    const messages = body.messages ?? [];
    const lastUser = messages.filter(m => m.role === 'user').at(-1);
    const userInput = body.message ?? lastUser?.content ?? '';

    const { input, messages: updatedMessages, violations } = rules.applyRules(userInput, messages);

    const useRag = body.useRag ?? false;
    const topK = body.topK ?? 4;

    let contextMsg: { role: 'system' | 'user' | 'assistant'; content: string } | null = null;
    if (useRag && input.trim()) {
      const docs = await searchSimilar(input, topK);
      if (docs.length > 0) {
        const context = docs
          .map((d, i) => `[#${i + 1}${d.source ? ` | ${d.source}` : ''}]\n${d.text}`)
          .join('\n\n');
        const instruction = `Context from dataset:\n${context}`;
        contextMsg = { role: 'system', content: instruction };
      }
    }

    // PURE retrieval (MiniSearch)
    const retrievalQuery = buildRetrievalQuery(userInput, body.history ?? messages);
    const retrieved = retrievalQuery.trim() ? await searchPure(retrievalQuery, 8) : [];

    const systemPrompt: Message = {
      role: 'system',
      content: 'You are a local assistant. No external AI providers are used.'
    };

    const chatMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt.content },
      ...(contextMsg ? [contextMsg] : []),
      ...updatedMessages.map((m) => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: input },
    ];

    // Local deterministic response
    let content = '';
    const lower = userInput.toLowerCase();
    if (lower.includes('generate srs')) {
      const retrievedText = retrieved.map((r) => r.text);
      content = buildSrsSkeleton(userInput, retrievedText);
    } else if (contextMsg) {
      content = `I found relevant information in your dataset that may answer your question. Review the cited context above. If you need a summary, ask me to summarize specific sections by their # index.`;
    } else {
      content = retrieved.length
        ? `You asked: "${userInput}". See retrieved requirement snippets above; specify which to adapt.`
        : `Dataset not used or no relevant entries found. You asked: "${userInput}". Provide actors, features, constraints to draft an SRS.`;
    }

    const { response, warnings, isAllowable } = rules.verifyResponse(content);
    const assistantMessage: Message = { role: 'assistant', content: response };

    const payload: ChatResponseBody & { retrieved: typeof retrieved } = {
      ok: isAllowable,
      message: assistantMessage,
      error: isAllowable ? undefined : 'Response was blocked by verification layer.',
      retrieved,
    };

    return NextResponse.json(payload, {
      headers: {
        'X-Chat-Violations': violations.join('; '),
        'X-Chat-Warnings': warnings.join('; '),
      },
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Chat API error:', message);
    const payload: ChatResponseBody = { ok: false, error: message };
    return NextResponse.json(payload, { status: 500 });
  }
}

export const runtime = 'nodejs';
