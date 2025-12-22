import { useState } from 'react';
import type { Message } from '@/lib/types';

type Provider = 'openai' | 'gemini';

interface UseChatReturn {
  messages: Message[];
  input: string;
  loading: boolean;
  error: string | null;
  provider: Provider;
  setInput: (input: string) => void;
  setProvider: (provider: Provider) => void;
  sendMessage: () => Promise<void>;
  clearError: () => void;
  resetChat: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider>('openai');

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    setError(null);
    const newMessages: Message[] = [...messages, { role: 'user', content: input.trim() }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const url = provider === 'openai' ? '/api/chat' : '/api/chat/gemini';
      const res = await fetch(url, {
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

  const clearError = () => setError(null);

  const resetChat = () => {
    setMessages([]);
    setInput('');
    setError(null);
  };

  return {
    messages,
    input,
    loading,
    error,
    provider,
    setInput,
    setProvider,
    sendMessage,
    clearError,
    resetChat,
  };
}

