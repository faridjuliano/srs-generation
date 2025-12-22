import { useState } from 'react';
import type { Message } from '@/lib/types';

interface UseChatReturn {
  messages: Message[];
  input: string;
  loading: boolean;
  error: string | null;
  useRag: boolean;
  setInput: (input: string) => void;
  setUseRag: (v: boolean) => void;
  sendMessage: () => Promise<void>;
  clearError: () => void;
  resetChat: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useRag, setUseRag] = useState<boolean>(true);

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
        body: JSON.stringify({ messages: newMessages, useRag }),
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
    useRag,
    setInput,
    setUseRag,
    sendMessage,
    clearError,
    resetChat,
  };
}
