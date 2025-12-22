"use client";

import { useState } from 'react';
import type { Message } from '@/lib/types';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    setError(null);
    const newMessages: Message[] = [...messages, { role: 'user', content: input.trim() }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Request failed');
      }
      if (data.message) {
        setMessages(prev => [...prev, data.message]);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">AI Chatbot</h1>

      <div className="flex-1 space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        {messages.length === 0 && (
          <p className="text-sm text-zinc-500">Ask me anything to get started.</p>) }
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <span className={
              'inline-block max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm ' +
              (m.role === 'user'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black'
                : 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100')
            }>{m.content}</span>
          </div>
        ))}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      <p className="mt-2 text-xs text-zinc-500">Using OpenAI via server route with additional rules and verification layers.</p>
    </div>
  );
}
