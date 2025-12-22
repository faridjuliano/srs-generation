import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import * as rules from '@/lib/rules';
import { ChatRequestBody, ChatResponseBody, Message } from '@/lib/types';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const messages = body.messages ?? [];

    const lastUser = messages.filter(m => m.role === 'user').at(-1);
    const userInput = lastUser?.content ?? '';

    const { input, messages: updatedMessages, violations } = rules.applyRules(userInput, messages);

    const systemPrompt: Message = {
      role: 'system',
      content: 'You are a helpful assistant. Follow user instructions carefully while staying within allowed policies.'
    };

    const chatMessages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt.content },
      ...updatedMessages.map<ChatCompletionMessageParam>((m) => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: input },
    ];

    const result = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: chatMessages,
      temperature: 0.7,
    });

    const content = result.choices?.[0]?.message?.content ?? '';
    const { response, warnings, isAllowable } = rules.verifyResponse(content);

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
    console.error('Chat API error:', message);
    const payload: ChatResponseBody = { ok: false, error: message };
    return NextResponse.json(payload, { status: 500 });
  }
}

export const runtime = 'edge';
