import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as rules from '@/lib/rules';
import type { ChatRequestBody, ChatResponseBody, Message } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      const payload: ChatResponseBody = { ok: false, error: 'Missing GOOGLE_GENERATIVE_AI_API_KEY' };
      return NextResponse.json(payload, { status: 500 });
    }

    const body = (await request.json()) as ChatRequestBody & { model?: string };
    const messages = body.messages ?? [];

    const lastUser = messages.filter((m) => m.role === 'user').at(-1);
    const userInput = lastUser?.content ?? '';

    const { input, messages: updatedMessages, violations } = rules.applyRules(userInput, messages);

    const systemPrompt: Message = {
      role: 'system',
      content: 'You are a helpful assistant. Follow user instructions carefully while staying within allowed policies.'
    };

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = body.model || 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: systemPrompt.content });

    // Convert our chat messages to Gemini contents format
    const contents = [
      ...updatedMessages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      { role: 'user', parts: [{ text: input }] },
    ];

    const result = await model.generateContent({ contents });
    const text = result.response.text() ?? '';

    const { response, warnings, isAllowable } = rules.verifyResponse(text);
    const assistantMessage: Message = { role: 'assistant', content: response };

    const payload: ChatResponseBody = {
      ok: isAllowable,
      message: assistantMessage,
      error: isAllowable ? undefined : 'Response was blocked by verification layer.',
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
    const payload: ChatResponseBody = { ok: false, error: message };
    return NextResponse.json(payload, { status: 500 });
  }
}

export const runtime = 'nodejs';
